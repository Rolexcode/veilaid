import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { BBoardPrivateState, Contract, Witnesses } from '../../contract/src/index';

// Internal names retain the example's BBoard prefix to minimize risk while the
// public product and documentation consistently use VeilAid.
export const bboardPrivateStateKey = 'veilaidPrivateState';
export type PrivateStateId = typeof bboardPrivateStateKey;

export type PrivateStates = {
  readonly veilaidPrivateState: BBoardPrivateState;
};

export type BBoardContract = Contract<BBoardPrivateState, Witnesses<BBoardPrivateState>>;
export type BBoardCircuitKeys = Exclude<keyof BBoardContract['impureCircuits'], number | symbol>;
export type BBoardProviders = MidnightProviders<BBoardCircuitKeys, PrivateStateId, BBoardPrivateState>;
export type DeployedBBoardContract = FoundContract<BBoardContract>;

export type BBoardDerivedState = {
  readonly issuedCount: bigint;
  readonly approvedClaimCount: bigint;
  readonly issuedCredentialSetSize: bigint;
  readonly usedNullifierSetSize: bigint;
};
