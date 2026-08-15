# VeilAid — 90-second demo script

## Opening — 0:00–0:15

“Students currently prove hardship by surrendering their identity, income records, and academic data. VeilAid changes the question from ‘show us everything’ to ‘prove only that you qualify.’”

## Deploy — 0:15–0:30

Click **Deploy VeilAid contract** and approve Lace.

“This is a real Compact contract deployed on Midnight PreProd. The dashboard will show only commitments, nullifiers, and aggregate counts.”

## Issue — 0:30–0:45

Click **Issue demo student credential** and approve the transaction.

“Our demo university attests that this student is enrolled and records an income value. The chain receives only a cryptographic commitment—not the original student record.”

## Prove — 0:45–1:05

Click **Prove eligibility privately** and approve Lace.

“The proof checks three facts locally: the student is enrolled, income is below ten thousand dollars, and the credential came from the approved issuer.”

Point to the success message and public dashboard.

“The contract now knows the claim is valid. It still does not know the student's name or exact income.”

## Duplicate protection — 1:05–1:20

Click **Try duplicate claim**.

“Privacy cannot mean double spending. A grant-specific anonymous nullifier blocks this second claim without creating a public identity.”

## Close — 1:20–1:30

“VeilAid can extend from student grants to disaster relief, healthcare assistance, and public benefits. Prove eligibility—not identity.”

## Recording checklist

- Start Docker Desktop and the proof server before recording.
- Confirm Lace is on PreProd and funded with free test tokens.
- Use a freshly deployed contract so counters begin at zero.
- Keep the browser zoom at 100% and notifications disabled.
- Record a backup take before submitting.
- End on the dashboard with the contract address visible.
