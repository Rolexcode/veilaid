/** Midnight integration layer for VeilAid. */

import * as BBoard from '../../contract/src/managed/bboard/contract/index.js';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import {
  type BBoardDerivedState,
  type BBoardContract,
  type BBoardProviders,
  type DeployedBBoardContract,
  bboardPrivateStateKey,
} from './common-types.js';
import { CompiledBBoardContractContract } from '../../contract/src/index';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { map, tap, type Observable } from 'rxjs';
import { BBoardPrivateState, createBBoardPrivateState } from '../../contract/src/witnesses.js';

export interface DeployedBBoardAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<BBoardDerivedState>;
  issueDemoCredential: () => Promise<void>;
  claimGrant: (grantId: Uint8Array, maximumIncome: bigint) => Promise<void>;
}

export class BBoardAPI implements DeployedBBoardAPI {
  private constructor(
    public readonly deployedContract: DeployedBBoardContract,
    providers: BBoardProviders,
    private readonly privateState: BBoardPrivateState,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    this.state$ = providers.publicDataProvider
      .contractStateObservable(this.deployedContractAddress, { type: 'latest' })
      .pipe(
        map((contractState) => BBoard.ledger(contractState.data)),
        tap((ledgerState) => logger?.trace({ ledgerStateChanged: ledgerState })),
        map((ledgerState) => ({
          issuedCount: ledgerState.issuedCount,
          approvedClaimCount: ledgerState.approvedClaimCount,
          issuedCredentialSetSize: ledgerState.issuedCredentials.size(),
          usedNullifierSetSize: ledgerState.usedNullifiers.size(),
        })),
      );
  }

  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<BBoardDerivedState>;

  async issueDemoCredential(): Promise<void> {
    const state = this.privateState;
    const txData = await this.deployedContract.callTx.issueCredential(
      state.studentSecret,
      state.enrollmentStatus,
      state.householdIncome,
      state.credentialNonce,
    );
    this.logger?.info({ circuit: 'issueCredential', txHash: txData.public.txHash });
  }

  async claimGrant(grantId: Uint8Array, maximumIncome: bigint): Promise<void> {
    const txData = await this.deployedContract.callTx.claimGrant(grantId, maximumIncome);
    this.logger?.info({ circuit: 'claimGrant', txHash: txData.public.txHash });
  }

  static async deploy(providers: BBoardProviders, logger?: Logger): Promise<BBoardAPI> {
    const issuerSecret = utils.randomBytes(32);
    const studentSecret = utils.randomBytes(32);
    const credentialNonce = utils.randomBytes(32);
    const privateState = createBBoardPrivateState(studentSecret, credentialNonce, 1n, 4_200n, issuerSecret);

    const deployed = await deployContract(providers, {
      compiledContract: CompiledBBoardContractContract,
      privateStateId: bboardPrivateStateKey,
      initialPrivateState: privateState,
      args: [BBoard.pureCircuits.issuerPublicKey(issuerSecret)],
    });
    logger?.info({ contractDeployed: deployed.deployTxData.public });
    return new BBoardAPI(deployed, providers, privateState, logger);
  }

  static async join(providers: BBoardProviders, contractAddress: ContractAddress, logger?: Logger): Promise<BBoardAPI> {
    const privateState = await BBoardAPI.getPrivateState(providers, contractAddress);
    const deployed = await findDeployedContract<BBoardContract>(providers, {
      contractAddress,
      compiledContract: CompiledBBoardContractContract,
      privateStateId: bboardPrivateStateKey,
      initialPrivateState: privateState,
    });
    return new BBoardAPI(deployed, providers, privateState, logger);
  }

  private static async getPrivateState(
    providers: BBoardProviders,
    contractAddress: ContractAddress,
  ): Promise<BBoardPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existing = await providers.privateStateProvider.get(bboardPrivateStateKey);
    return (
      existing ??
      createBBoardPrivateState(utils.randomBytes(32), utils.randomBytes(32), 1n, 4_200n, utils.randomBytes(32))
    );
  }
}

export * as utils from './utils/index.js';
export * from './common-types.js';
