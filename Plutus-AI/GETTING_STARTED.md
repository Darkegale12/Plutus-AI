# Getting Started with AI Workflow Orchestrator

This guide will help you set up and run the AI Workflow Orchestrator on your local machine.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Basic understanding of TypeScript
- (Optional) Cardano wallet for testnet

## Step 1: Install Dependencies

```powershell
cd "d:\cardano_hackathon\Cardano AI Agent"
npm install
```

This will install:
- `@modelcontextprotocol/sdk` - MCP server framework
- `uuid` - Unique identifier generation
- TypeScript and development tools

## Step 2: Configure Environment

Copy the example environment file:

```powershell
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
# Minimum required configuration
CARDANO_NETWORK=preprod
LOG_LEVEL=info

# Optional: Add your Cardano wallet (for actual payments)
# ORCHESTRATOR_WALLET_ADDRESS=addr_test1qz...
# BLOCKFROST_PROJECT_ID=preprodXXXXXXXXXXXX
```

For testing, the default mock values work fine!

## Step 3: Build the Project

```powershell
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

## Step 4: Run the Orchestrator

### Option A: Standalone Mode

```powershell
npm start
```

The orchestrator will start as an MCP server listening on stdio.

### Option B: With Claude Desktop

1. Open Claude Desktop configuration file:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the orchestrator:

```json
{
  "mcpServers": {
    "ai-workflow-orchestrator": {
      "command": "node",
      "args": ["d:\\cardano_hackathon\\Cardano AI Agent\\dist\\index.js"]
    }
  }
}
```

3. Restart Claude Desktop

4. You should see the orchestrator tools available!

## Step 5: Test the System

### Create Your First Workflow

In Claude (or using the MCP client), try:

```
Create a workflow to "Write a technical blog post about blockchain scalability"
```

The orchestrator will:
1. ✅ Decompose into subtasks (research, writing, editing, design)
2. ✅ Find suitable agents for each task
3. ✅ Assign agents based on reputation
4. ✅ Execute tasks autonomously
5. ✅ Validate outputs
6. ✅ Log events on-chain
7. ✅ Return completed workflow

### Check Workflow Status

```
Get the status of workflow <workflow-id>
```

### Discover Available Agents

```
Find agents with capabilities: writing, seo
```

### Check Agent Reputation

```
Get reputation for agent <agent-id>
```

## Example Workflows

### 1. Content Creation

**Goal:** "Create 5 SEO-optimized blog posts about DeFi"

**What Happens:**
- Research agent gathers DeFi information
- Writer agent creates 5 posts
- SEO agent optimizes for keywords
- Editor agent reviews and polishes
- Designer agent creates featured images

### 2. Data Analysis

**Goal:** "Analyze user engagement data and create dashboard"

**What Happens:**
- Data collection agent gathers metrics
- Cleaning agent preprocesses data
- Analysis agent performs statistical analysis
- Visualization agent creates charts
- Report agent generates insights

### 3. Software Development

**Goal:** "Build a REST API for task management"

**What Happens:**
- Architecture agent designs API
- Backend agent implements endpoints
- Database agent sets up schema
- Testing agent writes unit tests
- DevOps agent deploys to cloud

## Understanding the Output

### Workflow Creation Response

```json
{
  "success": true,
  "workflow_id": "uuid-here",
  "decomposed_tasks": [
    {
      "id": "task-1",
      "title": "Research and Planning",
      "requiredCapabilities": ["research", "planning"],
      "estimatedCost": 2.5,
      "assignedAgent": "ResearchScholar"
    }
    // ... more tasks
  ],
  "estimated_cost": 12.5,
  "assigned_agents": {
    "task-1": "ResearchScholar",
    "task-2": "ContentCreatorPro"
  }
}
```

### Status Response

```json
{
  "workflow_id": "uuid-here",
  "status": "executing",
  "progress": "60%",
  "tasks": {
    "total": 5,
    "completed": 3,
    "in_progress": 1,
    "pending": 1
  },
  "costs": {
    "estimated": 12.5,
    "actual": 7.5,
    "remaining_budget": 42.5
  }
}
```

## Troubleshooting

### Issue: "Wallet not connected"

**Solution:** This is expected in development mode. The system uses mock transactions. For real payments, configure:

```env
ORCHESTRATOR_WALLET_ADDRESS=your_address
ORCHESTRATOR_WALLET_MNEMONIC=your 24 words
BLOCKFROST_PROJECT_ID=your_project_id
```

### Issue: "No agents found"

**Solution:** The system registers default test agents on startup. If you see this error:

1. Check logs: `LOG_LEVEL=debug npm start`
2. Verify agent registry initialization
3. Ensure agents match required capabilities

### Issue: Build errors

**Solution:** 
```powershell
# Clean and rebuild
Remove-Item -Recurse -Force dist
npm run build
```

### Issue: "Module not found"

**Solution:**
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

## Development Mode

For active development:

```powershell
# Watch mode - auto-rebuilds on file changes
npm run dev
```

In another terminal:
```powershell
# Run the server
npm start
```

## Monitoring

Enable debug logging:

```env
LOG_LEVEL=debug
DEBUG=true
```

You'll see detailed logs:
- Task decomposition decisions
- Agent selection reasoning
- Validation scores
- Payment transactions
- On-chain logging

## Next Steps

1. **Explore Tools**: Try all available tools in the MCP interface
2. **Create Custom Workflows**: Test different business goals
3. **Register New Agents**: Add your own specialized agents
4. **Check Reputation**: Monitor agent performance
5. **Review On-Chain Data**: Verify blockchain logging

## Production Deployment

For production use:

1. **Set up Cardano wallet** with real ADA
2. **Configure Blockfrost** API for mainnet
3. **Implement authentication** for agent endpoints
4. **Set up monitoring** and alerting
5. **Deploy with PM2** or Docker
6. **Configure SSL/TLS** for secure communication

## Advanced Configuration

### Custom Agent Network

Connect to your own agent network:

```env
MASUMI_NETWORK_ENDPOINT=https://your-network.com
MASUMI_API_KEY=your_api_key
```

### Database Integration

For persistent storage:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/orchestrator
```

### Performance Tuning

```env
MAX_CONCURRENT_TASKS=20
AGENT_DISCOVERY_TIMEOUT=10000
DEFAULT_AGENT_TIMEOUT=60000
```

## Resources

- 📖 [Architecture Documentation](./ARCHITECTURE.md)
- 📖 [Full README](./README.md)
- 🔗 [Cardano Documentation](https://docs.cardano.org/)
- 🔗 [MCP Protocol](https://modelcontextprotocol.io/)

## Support

If you encounter issues:

1. Check the logs with `DEBUG=true`
2. Review the ARCHITECTURE.md for system details
3. Open an issue on GitHub
4. Join our community Discord

---

**Happy Orchestrating! 🚀**
