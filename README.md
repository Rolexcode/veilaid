# VeilAid

> Prove eligibility, not identity.

[![Midnight](https://img.shields.io/badge/Midnight-PreProd-6f3cff)](https://midnight.network/)
[![Compact](https://img.shields.io/badge/Compact-0.31.x-163d32)](https://docs.midnight.network/compact/)
[![Tests](https://img.shields.io/badge/tests-6%20passing-1f7a55)](#test)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

VeilAid is a privacy-preserving student-aid application built on Midnight. It lets an institution verify that an applicant is enrolled, falls below an income threshold, and has not already claimed a grant—without publishing the applicant's name, exact income, student record, or reusable identity.

Built for **Brainwave 2026 — Midnight Track**.

## Submission status

| Component        | Status                                               |
| ---------------- | ---------------------------------------------------- |
| Compact contract | Compiles successfully                                |
| Simulator suite  | 6/6 tests passing                                    |
| Web application  | Production build passing                             |
| Target network   | Midnight PreProd                                     |
| Real deployment  | Contract address added after final wallet deployment |

## Why it matters

Financial-aid systems routinely collect some of the most sensitive information a student owns. Centralized copies of identity documents, income records, and academic data create surveillance and breach risk. VeilAid replaces document disclosure with a zero-knowledge eligibility proof.

The public ledger contains only:

- commitments to credentials issued by an approved institution;
- grant-specific nullifiers that prevent duplicate claims;
- aggregate counts of credentials and accepted claims.

Raw student attributes stay in local private state.

## Demo flow

1. Deploy the VeilAid Compact contract on Midnight PreProd.
2. The demo institution issues a private student credential.
3. The student proves enrollment and `household income <= $10,000`.
4. The contract accepts the claim without exposing the underlying attributes.
5. Submit the same claim again; the contract rejects the duplicate nullifier.
6. The public dashboard shows aggregate claims while exposed identity and income records remain zero.

## Architecture

```text
Demo institution                 Student browser
      │                               │
      │ issue private credential      │ local private state
      ▼                               ▼
┌─────────────────────────────────────────────┐
│ Midnight Compact contract                   │
│                                             │
│ issuedCredentials: Set<commitment>          │
│ usedNullifiers: Set<nullifier>              │
│ issuedCount / approvedClaimCount            │
└─────────────────────────────────────────────┘
      ▲                               │
      │ issuer authorization          │ ZK eligibility proof
      │                               ▼
  issuer secret                enrollment = true
                               income <= threshold
                               credential exists
                               nullifier unused
```

The contract source is [`contract/src/bboard.compact`](contract/src/bboard.compact). The internal `bboard` path remains from Midnight's official reference template to reduce integration risk; all product behavior is VeilAid-specific.

## Privacy model

### Private

- student secret;
- enrollment status;
- exact household income;
- credential nonce;
- issuer secret.

### Public

- hash-derived issuer key;
- credential commitment;
- grant-specific nullifier;
- issued and approved counters;
- transaction and contract identifiers.

### Important limitation

The hackathon demo uses a simulated university issuer. In production, an accredited institution would issue the commitment from its student-information system. VeilAid does not claim that a blockchain can independently determine whether a real-world record is truthful; it proves statements about records attested by the configured issuer.

## Prerequisites

- Windows 11 with WSL 2 and Ubuntu, or a supported Linux/macOS environment;
- Node.js `>=24.11.1`;
- Docker Desktop with WSL integration;
- Compact toolchain `0.31.x`;
- Lace wallet configured for Midnight PreProd;
- free PreProd tNIGHT and generated tDUST.

No real funds are required.

## Install

```bash
npm install
```

On Windows, install Compact inside WSL:

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source "$HOME/.local/bin/env"
compact update
```

## Compile the contract

From WSL:

```bash
cd /mnt/c/path/to/veilaid/contract
compact compile src/bboard.compact ./src/managed/bboard
```

## Test

```bash
npm run check
```

The contract suite covers:

- successful issuance and eligibility;
- duplicate-claim rejection;
- excessive-income rejection;
- missing-credential rejection;
- unauthorized issuer rejection.

## Run the proof server

Start Docker Desktop, then:

```bash
docker run --rm -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

Keep it running while using the application.

## Configure Lace

1. Install or open Lace.
2. Select the **Midnight PreProd** network.
3. Set the proof server to `http://localhost:6300`.
4. Request free tNIGHT from the PreProd faucet.
5. Generate tDUST in Lace.

## Build and run

```bash
npm run build
npx http-server --port 4173 bboard-ui/dist
```

Open `http://127.0.0.1:4173` in the browser that has Lace installed.

## Project structure

```text
contract/    Compact contract, witnesses, generated circuits, simulator tests
api/         Midnight deployment, state subscriptions, transaction calls
bboard-ui/   React + Vite judge-facing application
docs/        Architecture, demo, and submission material
```

## Security decisions

- Domain-separated hashes are used for issuer keys, credentials, and claims.
- A claim nullifier is scoped to a grant, preventing replay without creating a universal student identifier.
- Eligibility comparisons happen inside the Compact circuit.
- The contract verifies credential membership before accepting a claim.
- Only the configured issuer secret can issue credential commitments.

## Built with

- Midnight Compact `0.23` language / `0.31.x` compiler
- Midnight.js `4.1.1`
- Midnight wallet SDK and Lace connector
- React 19, Vite 8, Material UI 9
- Vitest

## License

Apache-2.0, following the Midnight reference implementation used as the integration base.
