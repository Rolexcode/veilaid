import { describe, expect, it } from "vitest";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { BBoardSimulator } from "./bboard-simulator.js";
import { randomBytes } from "./utils.js";
import { type BBoardPrivateState } from "../witnesses.js";

setNetworkId("undeployed");

const grantId = new Uint8Array(32).fill(7);

const eligibleStudent = (): BBoardPrivateState => ({
  issuerSecret: new Uint8Array(32).fill(1),
  studentSecret: randomBytes(32),
  enrollmentStatus: 1n,
  householdIncome: 4_200n,
  credentialNonce: randomBytes(32),
});

describe("VeilAid smart contract", () => {
  it("starts with no credentials or approved claims", () => {
    const simulator = new BBoardSimulator(eligibleStudent());
    expect(simulator.getLedger().issuedCount).toBe(0n);
    expect(simulator.getLedger().approvedClaimCount).toBe(0n);
  });

  it("issues a private credential and accepts an eligible claim", () => {
    const simulator = new BBoardSimulator(eligibleStudent());
    simulator.issueCredential();
    simulator.claimGrant(grantId, 10_000n);
    expect(simulator.getLedger().issuedCount).toBe(1n);
    expect(simulator.getLedger().approvedClaimCount).toBe(1n);
    expect(simulator.getLedger().usedNullifiers.size()).toBe(1n);
  });

  it("rejects a duplicate claim for the same grant", () => {
    const simulator = new BBoardSimulator(eligibleStudent());
    simulator.issueCredential();
    simulator.claimGrant(grantId, 10_000n);
    expect(() => simulator.claimGrant(grantId, 10_000n)).toThrow(
      "failed assert: This credential has already claimed this grant",
    );
  });

  it("rejects an applicant above the private income threshold", () => {
    const student = eligibleStudent();
    const simulator = new BBoardSimulator(student);
    simulator.issueCredential();
    simulator.switchPrivateState({ ...student, householdIncome: 25_000n });
    expect(() => simulator.claimGrant(grantId, 10_000n)).toThrow(
      "failed assert: Applicant does not meet this grant's income rule",
    );
  });

  it("rejects a credential that was not issued by the institution", () => {
    const simulator = new BBoardSimulator(eligibleStudent());
    expect(() => simulator.claimGrant(grantId, 10_000n)).toThrow(
      "failed assert: No credential from the approved institution was found",
    );
  });

  it("rejects credential issuance from a different issuer", () => {
    const student = eligibleStudent();
    const simulator = new BBoardSimulator(student);
    simulator.switchPrivateState({
      ...student,
      issuerSecret: new Uint8Array(32).fill(9),
    });
    expect(() => simulator.issueCredential()).toThrow(
      "failed assert: Only the approved institution can issue credentials",
    );
  });
});
