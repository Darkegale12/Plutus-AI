# Example Usage Guide

This directory contains examples showing how to use and extend the AI Workflow Orchestrator.

## Running Example Agents

### Content Creator Agent

A sample specialized agent that handles content creation tasks.

**Start the agent:**

```bash
cd examples
node content-creator-agent.js
```

The agent will start on port 3001 and register these capabilities:
- writing
- content_creation
- seo
- editing

**Test the agent:**

```bash
curl http://localhost:3001/health
```

**Send a task:**

```bash
curl -X POST http://localhost:3001/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "test-001",
    "task_description": "Write a blog post about blockchain",
    "requirements": ["SEO optimized", "1500 words"],
    "context": {}
  }'
```

## Workflow Examples

### Example 1: Simple Content Creation

```typescript
// Using the orchestrator MCP tools
{
  "tool": "create_workflow",
  "arguments": {
    "goal": "Write a technical article about Cardano smart contracts",
    "budget": 10.0,
    "quality_threshold": 0.85
  }
}
```

**Expected Result:**
- Task decomposition into research, writing, editing, SEO
- Automatic agent assignment
- Quality validation
- On-chain logging

### Example 2: Data Analysis Pipeline

```typescript
{
  "tool": "create_workflow",
  "arguments": {
    "goal": "Analyze cryptocurrency market trends and create visualization dashboard",
    "budget": 25.0,
    "deadline": "2025-12-31T23:59:59Z",
    "quality_threshold": 0.90
  }
}
```

**Expected Result:**
- Data collection from multiple sources
- Statistical analysis
- Visualization creation
- Insights report generation

### Example 3: Software Development

```typescript
{
  "tool": "create_workflow",
  "arguments": {
    "goal": "Build a REST API for user authentication with JWT tokens",
    "budget": 50.0,
    "quality_threshold": 0.95
  }
}
```

**Expected Result:**
- Architecture design
- Backend implementation
- API documentation
- Unit tests
- Deployment scripts

## Registering Custom Agents

### Register via MCP Tool

```typescript
{
  "tool": "register_agent",
  "arguments": {
    "agent_name": "MyCustomAgent",
    "capabilities": ["custom_skill_1", "custom_skill_2"],
    "endpoint": "http://localhost:3002/execute",
    "pricing": {
      "per_task": 3.0,
      "currency": "ADA"
    },
    "wallet_address": "addr_test1qz..."
  }
}
```

### Agent Implementation Template

```javascript
const express = require('express');
const app = express();

app.post('/execute', async (req, res) => {
  const { task_id, task_description } = req.body;
  
  // Your agent logic here
  const result = await performTask(task_description);
  
  res.json({
    task_id,
    status: 'completed',
    output: result,
    timestamp: new Date().toISOString(),
  });
});

app.listen(3002);
```

## Monitoring Workflows

### Check Status

```typescript
{
  "tool": "get_workflow_status",
  "arguments": {
    "workflow_id": "abc-123-def-456"
  }
}
```

### View Active Workflows

Access the resource:
```
workflow://active
```

## Agent Discovery

### Find Agents by Capability

```typescript
{
  "tool": "discover_agents",
  "arguments": {
    "required_capabilities": ["data_analysis", "visualization"],
    "min_reputation": 0.8,
    "max_budget": 5.0
  }
}
```

### View All Agents

Access the resource:
```
agents://registry
```

## Quality Validation

### Validate Agent Output

```typescript
{
  "tool": "validate_agent_output",
  "arguments": {
    "task_id": "task-123",
    "agent_id": "agent-456",
    "output": {
      "content": "...",
      "metadata": {}
    },
    "validation_criteria": ["completeness", "accuracy"]
  }
}
```

## Reputation Management

### Check Agent Reputation

```typescript
{
  "tool": "get_agent_reputation",
  "arguments": {
    "agent_id": "agent-456"
  }
}
```

**Response includes:**
- Overall reputation score
- Success rate
- Total tasks completed
- Quality metrics
- Badges and tier
- Performance history

## Payment Examples

### Execute Payment

```typescript
{
  "tool": "execute_payment",
  "arguments": {
    "agent_id": "agent-456",
    "amount": 2.5,
    "task_id": "task-123"
  }
}
```

### Payment with Escrow

For high-value tasks, escrow contracts ensure payment security.

## Advanced Patterns

### Multi-Stage Workflows

Create workflows with explicit dependencies:

```typescript
// Stage 1: Research
const research = await createTask({
  title: "Market Research",
  capabilities: ["research"]
});

// Stage 2: Analysis (depends on research)
const analysis = await createTask({
  title: "Data Analysis",
  capabilities: ["data_analysis"],
  dependencies: [research.id]
});

// Stage 3: Report (depends on analysis)
const report = await createTask({
  title: "Generate Report",
  capabilities: ["reporting"],
  dependencies: [analysis.id]
});
```

### Agent Negotiation

```typescript
{
  "tool": "negotiate_with_agent",
  "arguments": {
    "agent_id": "agent-456",
    "task_requirements": {
      "complexity": "high",
      "deadline": "2025-12-15"
    },
    "proposed_budget": 4.0
  }
}
```

## Blockchain Integration

### Log Custom Events

```typescript
{
  "tool": "log_workflow_event",
  "arguments": {
    "workflow_id": "workflow-123",
    "event_type": "custom_milestone",
    "event_data": {
      "milestone": "Phase 1 Complete",
      "details": "All research tasks finished"
    }
  }
}
```

### Verify Transactions

Query blockchain to verify payments and logs:

```typescript
const tx = await cardanoIntegration.getTransactionDetails(txHash);
console.log('Confirmations:', tx.confirmations);
```

## Testing

### Unit Testing Agents

```javascript
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('Content Creator Agent', () => {
  it('should complete a task', async () => {
    const res = await chai.request('http://localhost:3001')
      .post('/execute')
      .send({
        task_id: 'test-1',
        task_description: 'Write blog post'
      });
    
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('completed');
  });
});
```

### Integration Testing

Test full workflow execution with mock agents.

## Best Practices

1. **Agent Design**
   - Implement health checks
   - Return structured outputs
   - Include quality indicators
   - Handle errors gracefully

2. **Task Decomposition**
   - Break into logical units
   - Define clear dependencies
   - Specify required capabilities

3. **Quality Validation**
   - Set appropriate thresholds
   - Define custom criteria
   - Monitor quality trends

4. **Cost Management**
   - Set realistic budgets
   - Monitor actual costs
   - Use escrow for large tasks

5. **Reputation**
   - Track agent performance
   - Reward quality work
   - Penalize poor performance

## Troubleshooting

### Agent Not Responding

```bash
# Check agent health
curl http://localhost:3001/health

# Check orchestrator logs
DEBUG=true npm start
```

### Payment Failed

Check wallet configuration and balance:
```bash
# View network status
curl -X POST orchestrator/tool/get_network_status
```

### Quality Validation Failed

Review validation criteria and agent output format.

## Resources

- [Main README](../README.md)
- [Architecture Guide](../ARCHITECTURE.md)
- [Getting Started](../GETTING_STARTED.md)

---

For more examples and templates, visit the GitHub repository.
