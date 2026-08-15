# Devpost submission draft

## Project name

VeilAid

## Tagline

Prove eligibility, not identity.

## Inspiration

Students seeking emergency support are often asked to upload identity documents, income statements, and academic records to yet another centralized database. The people who most need help should not have to make their hardship permanently visible. Midnight makes a different model possible: verify the facts required by a program while keeping the underlying record private.

## What it does

VeilAid lets an approved institution issue a private student credential. An applicant can then prove that they are enrolled, fall below a grant's income threshold, and have not already claimed that grant. The Compact contract accepts or rejects the claim while the applicant's name, exact income, and academic record remain private.

A public dashboard provides accountability through aggregate credential and claim counts. A grant-specific anonymous nullifier prevents duplicate claims without creating a reusable public identity.

## How we built it

The project uses a Compact smart contract deployed through Midnight.js. Private applicant attributes are supplied as local witnesses. The institution writes only a domain-separated credential commitment to the public ledger. During a claim, the circuit recomputes that commitment, verifies membership, checks private enrollment and income conditions, derives a grant-specific nullifier, and rejects reuse.

The full-stack application uses React, Vite, Material UI, the Midnight DApp Connector API, Lace, a local Midnight proof server, and PreProd network providers. Simulator tests exercise both the successful flow and the contract's rejection paths.

## Challenges

The most important design challenge was preventing private claims from becoming either unauditable or reusable. A universal identifier would undermine privacy, while no identifier would permit repeat claims. We solved this by deriving a nullifier from the student's private secret, credential nonce, and grant identifier. It is stable for one grant but unlinkable across different grant programs.

We also kept the real-world trust boundary explicit: Midnight proves statements about a credential issued by the configured institution; it does not magically determine whether an off-chain student record is truthful.

## Accomplishments

- A functioning Compact contract with two ZK-enabled transaction circuits.
- Authorized private credential issuance.
- Private enrollment and income-threshold verification.
- Grant-scoped duplicate-claim prevention.
- Real Midnight wallet, proof-server, and network integration.
- Six passing simulator tests covering success and key failure cases.
- An accessible, responsive interface designed for a clear 90-second demonstration.

## What we learned

Privacy applications still need carefully chosen public state. Commitments provide auditability without raw records, and nullifiers provide replay protection without identity disclosure. We also learned that the strongest privacy UX explains what is being proved, what remains hidden, and what becomes public before the user approves a transaction.

## What's next

The next step is integrating real university credential issuers and supporting multiple grant policies. Longer term, VeilAid can serve scholarships, disaster relief, healthcare support, and public-benefit programs while giving auditors aggregate accountability and applicants data minimization.

## Built with

Midnight, Compact, Midnight.js, Lace, React, TypeScript, Vite, Material UI, Vitest, Docker
