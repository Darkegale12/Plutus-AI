# AI Workflow Orchestrator - Quick Reference

## 🚀 Quick Start Commands

```powershell
# Setup (first time only)
.\setup.ps1

# Build
npm run build

# Run
npm start

# Development mode
npm run dev
```

## 🔧 MCP Tools Reference

### 1. create_workflow
Create and execute a new workflow

**Parameters:**
- `goal` (required): High-level business objective
- `budget` (optional): Maximum ADA to spend
- `deadline` (optional): ISO 8601 deadline
- `quality_threshold` (optional): 0-1 score, default 0.8

**Example:**
```json
{
  "goal": "Create marketing campaign for DeFi product",
  "budget": 50.0,
  "quality_threshold": 0.9
}
```

---

### 2. get_workflow_status
Monitor workflow progress

**Parameters:**
- `workflow_id` (required): UUID of workflow

**Returns:** Progress, tasks, costs, timing

---

### 3. register_agent
Add new specialized agent

**Parameters:**
- `agent_name` (required): Display name
- `capabilities` (required): Array of skills
- `endpoint` (required): HTTP endpoint
- `pricing` (required): Cost structure
- `wallet_address` (required): Cardano address

---

### 4. discover_agents
Find agents by capabilities

**Parameters:**
- `required_capabilities` (required): Skills needed
- `max_budget` (optional): Cost limit
- `min_reputation` (optional): Quality threshold

---

### 5. validate_agent_output
Check output quality

**Parameters:**
- `task_id` (required): Task identifier
- `agent_id` (required): Agent identifier
- `output` (required): Result object
- `validation_criteria` (optional): Custom checks

---

### 6. get_agent_reputation
View agent performance

**Parameters:**
- `agent_id` (required): Agent identifier

**Returns:** Score, history, badges, tier

---

### 7. execute_payment
Send ADA to agent

**Parameters:**
- `agent_id` (required): Agent identifier
- `amount` (required): ADA amount
- `task_id` (required): Task identifier

---

### 8. log_workflow_event
Record event on-chain

**Parameters:**
- `workflow_id` (required): Workflow identifier
- `event_type` (required): Event category
- `event_data` (required): Event details

**Event Types:**
- `started`, `task_assigned`, `task_completed`
- `validated`, `payment`, `completed`, `failed`

---

### 9. negotiate_with_agent
Discuss pricing and terms

**Parameters:**
- `agent_id` (required): Agent identifier
- `task_requirements` (required): Task specs
- `proposed_budget` (optional): Offer amount

---

## 📚 Resources

### workflow://active
List all active workflows

### agents://registry
List all registered agents

---

## 🎯 Common Workflows

### Content Creation
```
Goal: "Write 5 blog posts about blockchain"
→ Research → Writing → SEO → Editing → Design
Agents: ResearchScholar, ContentCreatorPro, etc.
Cost: ~10-15 ADA
```

### Data Analysis
```
Goal: "Analyze sales data and create dashboard"
→ Collection → Cleaning → Analysis → Visualization → Report
Agents: DataAnalystAI, etc.
Cost: ~15-25 ADA
```

### Software Development
```
Goal: "Build REST API for authentication"
→ Architecture → Backend → Testing → Deployment
Agents: CodeCrafterBot, etc.
Cost: ~30-50 ADA
```

---

## 🏆 Reputation Tiers

- 🥉 **Bronze**: < 10 tasks
- 🥈 **Silver**: 10+ tasks, 75%+ score
- 🥇 **Gold**: 20+ tasks, 85%+ score
- 💎 **Platinum**: 50+ tasks, 95%+ score

---

## 🎖️ Agent Badges

- **Veteran**: 100+ tasks
- **Expert**: 50+ tasks
- **Experienced**: 10+ tasks
- **Quality Master**: 95%+ avg quality
- **High Quality**: 90%+ avg quality
- **Perfect Streak**: 10 consecutive successes
- **Fast Responder**: < 1 hour response
- **Multi-Skilled**: 5+ capabilities

---

## ⚙️ Environment Variables

```env
# Required
CARDANO_NETWORK=preprod
LOG_LEVEL=info

# Optional (for production)
ORCHESTRATOR_WALLET_ADDRESS=addr_test1qz...
ORCHESTRATOR_WALLET_MNEMONIC=word1 word2 ...
BLOCKFROST_PROJECT_ID=preprodXXXXXXXXXX

# Tuning
MAX_CONCURRENT_TASKS=10
DEFAULT_AGENT_TIMEOUT=30000
MIN_REPUTATION_SCORE=0.7
```

---

## 🔍 Troubleshooting

### Build Errors
```powershell
Remove-Item -Recurse -Force dist, node_modules
npm install
npm run build
```

### Agent Not Found
- Check agent registration
- Verify capabilities match
- Ensure agent status is "active"

### Payment Failed
- Check wallet configuration
- Verify sufficient balance
- Check network connectivity

### Quality Validation Failed
- Review validation criteria
- Check quality_threshold setting
- Verify agent output format

---

## 📞 Support

- 📖 Full docs: [README.md](./README.md)
- 🏗️ Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- 🚀 Getting Started: [GETTING_STARTED.md](./GETTING_STARTED.md)
- 💡 Examples: [examples/README.md](./examples/README.md)

---

## 🔗 Useful Links

- [Cardano Docs](https://docs.cardano.org/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Blockfrost](https://blockfrost.io/)
- [Masumi Network](https://masumi.network/)

---

**Version 1.0.0** | MIT License | Built with ❤️ for Cardano
