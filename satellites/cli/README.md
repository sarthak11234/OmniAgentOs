# OmniAgent CLI Satellite

The official command-line interface for OmniAgentOs.

## Installation

### From Source
```bash
go install omni-cli
```

### Build Manually
```bash
git clone https://github.com/omniagentos/omni-cli
cd omni-cli
go build -o omni-cli main.go
```

## Configuration
The CLI supports persistent configuration via `omni-cli config`.

```bash
# Set backend URL
omni-cli config set server http://localhost:8000

# Set Authentication Token
omni-cli login
```

## Usage

### Chat with Cortex (Query)
Send a one-off query to the brain.
```bash
omni-cli chat "What is the status of the server?"
```

### Context Management
Upload files to the active context.
```bash
omni-cli ctx add ./myfile.txt
```

### Satellite Mode (Stream)
Connect to the backend as a satellite for real-time streaming.
```bash
omni-cli start
```

### Check Status
```bash
omni-cli status
```
