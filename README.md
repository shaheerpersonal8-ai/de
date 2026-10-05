# Proofly — AI-Verified Escrow

This repository contains the Anchor program, backend API, and frontend for the Proofly AI-verified escrow MVP. The program enforces escrow logic on Solana while the Proofly service evaluates milestone evidence and produces a signed attestation before funds are released.

## Smart Contract

### Instructions

- `create_escrow`: Creates the escrow and vault, then atomically funds the vault with lamports.
- `create_milestone`: Creates a milestone and allocates funds within the escrow.
- `set_milestone_requirements`: Sets the canonicalized requirements hash for a milestone.
- `create_attestation`: Records a Proofly AI evaluation attestation for a milestone (signed by the evaluator).
- `release_milestone`: Releases a milestone using the client-approved flow (manual release).
- `release_milestone_with_attestation`: Verifies the attestation and releases escrowed funds only when the signed Proofly policy result approves the milestone (automatic release).
- `cancel_escrow`: Cancels the active escrow and returns remaining funds to the client.
- `close_completed_escrow`: Closes completed accounts and returns rent.

## Proofly Workflow

1. **Client creates escrow** with total amount and milestone count.
2. **Client creates milestone(s)** with amount and due date.
3. **Client sets requirements** (canonicalized hash stored on-chain).
4. **Client funds the escrow** by creating it with the total amount.
5. **Freelancer submits evidence** (URL, repo link, screenshots, etc.).
6. **Proofly backend evaluates**:
   - Runs deterministic checks (URL reachability, file existence, tests, etc.).
   - Runs AI evaluation on semantic requirements.
   - Generates a PASS/FAIL/NEEDS_REVIEW decision.
7. **Proofly signs attestation** (if decision is PASS).
8. **Freelancer (or client) calls `release_milestone_with_attestation()`** on-chain.
9. **Program verifies attestation** against requirements_hash, evidence_hash, and signer authority.
10. **Funds released** and milestone marked as Released.
11. **Reputation event recorded** for the freelancer's verified work history.

## Data Structures

### Escrow
- `client`: wallet address of the client
- `freelancer`: wallet address of the freelancer
- `total_amount`: total lamports escrowed
- `allocated_amount`: sum of all milestone amounts
- `released_amount`: sum of all released milestone amounts
- `milestone_count`: number of milestones expected
- `completed_milestones`: number of milestones released
- `status`: Active, Completed, or Cancelled
- `requirements_hash`: SHA256 hash of canonicalized requirements
- `evaluator`: public key of the authorized Proofly evaluator
- `nonce`: replay protection nonce

### Milestone
- `escrow`: pubkey of parent escrow
- `index`: unique index within escrow (0..milestone_count-1)
- `amount`: lamports to release when this milestone is complete
- `due_at`: unix timestamp deadline
- `status`: Pending, Released, or Cancelled
- `requirements_hash`: SHA256 hash of requirements
- `evidence_hash`: SHA256 hash of evidence submission
- `evaluation_status`: Pending, Reviewed, Pass, Fail, or NeedsReview
- `evaluation_score`: confidence score (0-100)
- `attestation_nonce`: unique nonce for this attestation

### EvaluationAttestation
- `escrow`: pubkey of escrow
- `milestone`: pubkey of milestone
- `requirements_hash`: must match milestone.requirements_hash
- `evidence_hash`: SHA256 hash of the evaluated evidence
- `decision`: Pass (1), Fail (2), or NeedsReview (3)
- `evaluator`: pubkey of the signer (must be escrow.evaluator)
- `issued_at`: unix timestamp when attestation was created
- `expires_at`: unix timestamp when attestation expires
- `nonce`: unique identifier for replay protection

## Setup & Deployment

### Prerequisites

```bash
solana config set --url devnet
solana-keygen new -o ~/.config/solana/id.json
solana airdrop 2
```

### Build & Deploy

```bash
anchor build
anchor keys list
```

Replace `REPLACE_WITH_PROGRAM_ID` in `Anchor.toml` and `programs/proofly/src/lib.rs` with the generated program ID.

```bash
anchor build
anchor deploy --provider.cluster devnet
```

The generated IDL is available at `target/idl/proofly.json`.

### Backend Setup

```bash
cd server
npm install
```

Set environment variables:

```bash
export PROOFLY_PROGRAM_ID=<your_program_id>
export SOLANA_RPC_URL=https://api.devnet.solana.com
export PROOFLY_EVALUATOR_KEYPAIR=~/.config/solana/evaluator.json
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Security Notes

- This is an MVP. It has NOT been audited. Use devnet only until an independent security review is complete.
- Never store wallet secret keys in the server or repository.
- All requirements must be explicit and machine-checkable.
- The AI evaluator should NEVER have access to the client's or freelancer's wallet private keys.
- Attestations are time-limited and include a nonce for replay protection.
- The evaluator's keypair should be managed securely, separate from the client/freelancer keys.

## Lamports

1 SOL = 1,000,000,000 lamports
