import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
  pureCircuits,
} from "../managed/bboard/contract/index.js";
import { type BBoardPrivateState, witnesses } from "../witnesses.js";

export class BBoardSimulator {
  readonly contract: Contract<BBoardPrivateState>;
  circuitContext: CircuitContext<BBoardPrivateState>;

  constructor(privateState: BBoardPrivateState) {
    this.contract = new Contract<BBoardPrivateState>(witnesses);
    const initial = this.contract.initialState(
      createConstructorContext(privateState, "0".repeat(64)),
      pureCircuits.issuerPublicKey(privateState.issuerSecret),
    );
    this.circuitContext = {
      currentPrivateState: initial.currentPrivateState,
      currentZswapLocalState: initial.currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        initial.currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): BBoardPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public switchPrivateState(privateState: BBoardPrivateState): void {
    this.circuitContext.currentPrivateState = privateState;
  }

  public issueCredential(): Ledger {
    const state = this.getPrivateState();
    this.circuitContext = this.contract.impureCircuits.issueCredential(
      this.circuitContext,
      state.studentSecret,
      state.enrollmentStatus,
      state.householdIncome,
      state.credentialNonce,
    ).context;
    return this.getLedger();
  }

  public claimGrant(grantId: Uint8Array, maximumIncome: bigint): Ledger {
    this.circuitContext = this.contract.impureCircuits.claimGrant(
      this.circuitContext,
      grantId,
      maximumIncome,
    ).context;
    return this.getLedger();
  }
}
