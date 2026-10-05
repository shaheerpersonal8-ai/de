# Proofly Server Configuration Guide

## Environment Variables Setup

Before running the server, copy `.env.example` to `.env` and configure the required variables:

```bash
cp server/.env.example server/.env
```

## Required Variables

### Server Configuration
- **PORT** (default: 3000) - Express server port
- **NODE_ENV** (default: development) - Environment mode (development|staging|production)
- **SERVER_NAME** (default: proofly-server) - Server identifier

### Solana Blockchain
- **SOLANA_RPC_URL** (required) - Solana RPC endpoint
  - Devnet: `https://api.devnet.solana.com`
  - Testnet: `https://api.testnet.solana.com`
  - Mainnet: `https://api.mainnet-beta.solana.com`
- **SOLANA_NETWORK** (default: devnet) - Network name
- **PROOFLY_PROGRAM_ID** (default: G9Fc28faoqwHW6BMCskBPbzLTF3Cu7j4SZAbVJxgwgAG) - Program ID
- **SOLANA_COMMITMENT** (default: confirmed) - Commitment level (confirmed|finalized)

### Evaluator Service (CRITICAL)
- **PROOFLY_EVALUATOR_KEYPAIR** - JSON array of 64-byte secret key
  ```bash
  # Generate new keypair:
  solana-keygen new -o evaluator.json
  # Convert to JSON array and set in .env
  ```
- **EVALUATOR_KEYPAIR_PATH** (default: ~/.config/solana/evaluator.json) - Fallback keypair file
- **EVALUATOR_MODEL_VERSION** (default: gpt-4-turbo) - AI model version
- **EVALUATOR_VERSION** (default: 1.0.0) - Evaluator service version
- **AI_EVALUATION_TIMEOUT_MS** (default: 30000) - Timeout for AI evaluations
- **AI_MAX_RETRIES** (default: 3) - Max retry attempts
- **AI_RETRY_DELAY_MS** (default: 1000) - Retry delay with exponential backoff

### OpenAI API (Required for AI Evaluation)
- **OPENAI_API_KEY** (required) - OpenAI API key
  - Get from: https://platform.openai.com/api-keys
- **OPENAI_MODEL** (default: gpt-4-turbo) - Model name
- **OPENAI_TEMPERATURE** (default: 0.3) - Response temperature (0.0-1.0)
- **OPENAI_MAX_TOKENS** (default: 2000) - Max tokens per response
- **OPENAI_TIMEOUT_MS** (default: 30000) - API timeout

### Database
- **MONGODB_URI** (default: mongodb://localhost:27017/proofly) - MongoDB connection string
- **MONGODB_DATABASE** (default: proofly) - Database name

### Authentication
- **JWT_SECRET** (required in production) - JWT signing secret
  - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **JWT_EXPIRY** (default: 24h) - Token expiry time

### Security & CORS
- **CORS_ORIGINS** (default: http://localhost:3000,http://localhost:5173) - Allowed origins
- **RATE_LIMIT_WINDOW_MS** (default: 900000) - Rate limit window (15 minutes)
- **RATE_LIMIT_MAX_REQUESTS** (default: 100) - Max requests per window

### Logging & Audit
- **LOG_LEVEL** (default: info) - Log level (trace|debug|info|warn|error)
- **AUDIT_LOGGING_ENABLED** (default: true) - Enable audit logging
- **AUDIT_LOG_RETENTION_DAYS** (default: 90) - Audit log retention period

### Attestation
- **ATTESTATION_EXPIRY_HOURS** (default: 24) - Attestation validity period
- **ATTESTATION_NONCE_MIN** (default: 1) - Minimum nonce value

### Feature Flags
- **USE_MOCK_AI_EVALUATION** (default: true) - Use mock AI for development
- **ENABLE_AUDIT_LOGS** (default: true) - Enable audit trail logging
- **ENABLE_SIGNATURE_VERIFICATION** (default: true) - Enable Ed25519 verification
- **ENABLE_DETERMINISTIC_CHECKS** (default: true) - Enable deterministic checks

## Setup Instructions

### 1. Create .env file
```bash
cd server
cp .env.example .env
```

### 2. Generate Evaluator Keypair
```bash
# If you don't have Solana CLI installed:
npm install -g @solana/cli

# Generate new keypair:
solana-keygen new -o ~/.config/solana/evaluator.json

# Get the keypair as JSON array:
cat ~/.config/solana/evaluator.json | jq '.' 

# Set in .env:
PROOFLY_EVALUATOR_KEYPAIR=[1,2,3,...,64]
```

### 3. Get OpenAI API Key
```bash
# Visit: https://platform.openai.com/api-keys
# Create new secret key
# Add to .env:
OPENAI_API_KEY=sk-...
```

### 4. Configure Solana Network
```bash
# For devnet (default):
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# For testnet:
SOLANA_RPC_URL=https://api.testnet.solana.com
SOLANA_NETWORK=testnet
```

### 5. Start Server
```bash
npm run dev
```

## Environment Validation

The server will validate all critical environment variables on startup. Production deployments require:
- PROOFLY_EVALUATOR_KEYPAIR (set and valid)
- OPENAI_API_KEY (set)
- JWT_SECRET (set and not default value)
- MONGODB_URI (set and accessible)

If validation fails, the server will exit with detailed error messages.

## Security Best Practices

1. **Never commit .env to git** - Use `.env.example` for defaults only
2. **Store secrets securely** - Use environment variables or secure vaults in production
3. **Rotate evaluator keypair** - Periodically generate new keypairs
4. **Use strong JWT_SECRET** - Generate with crypto:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. **Monitor audit logs** - Review evaluation and signature events regularly
6. **Enable signature verification** - Always validate cryptographic signatures
7. **Set appropriate rate limits** - Adjust based on expected load

## Testing Configuration

For local development with mocks:
```bash
USE_MOCK_AI_EVALUATION=true
ENABLE_DETERMINISTIC_CHECKS=true
LOG_LEVEL=debug
```

For production:
```bash
NODE_ENV=production
USE_MOCK_AI_EVALUATION=false
LOG_LEVEL=info
ENABLE_AUDIT_LOGS=true
```
