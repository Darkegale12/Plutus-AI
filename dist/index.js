#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { WorkflowOrchestrator } from "./orchestrator/WorkflowOrchestrator.js";
import { AgentRegistry } from "./registry/AgentRegistry.js";
import { CardanoIntegration } from "./blockchain/CardanoIntegration.js";
import { ReputationSystem } from "./reputation/ReputationSystem.js";
import { logger } from "./utils/logger.js";
const orchestrator = new WorkflowOrchestrator();
const agentRegistry = new AgentRegistry();
const cardanoIntegration = new CardanoIntegration();
const reputationSystem = new ReputationSystem();
const server = new Server({
    name: "ai-marketing-campaign-orchestrator",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        resources: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "create_marketing_campaign",
                description: "Create a new AI-powered marketing campaign using SokoSumi agents. The orchestrator will decompose your campaign idea into subtasks (audience research, content strategy, viral content creation, social analytics), assign to specialized SokoSumi agents, and coordinate execution.",
                inputSchema: {
                    type: "object",
                    properties: {
                        campaign_idea: {
                            type: "string",
                            description: "Your marketing campaign idea or goal (e.g., 'Launch viral meme campaign for new crypto token targeting Gen Z')",
                        },
                        product_name: {
                            type: "string",
                            description: "Name of the product, service, or brand being promoted (optional)",
                        },
                        target_audience: {
                            type: "string",
                            description: "Target audience description (e.g., 'crypto enthusiasts 18-35', 'DeFi traders', optional)",
                        },
                        platforms: {
                            type: "array",
                            items: { type: "string" },
                            description: "Social media platforms to target (e.g., ['Instagram', 'Twitter', 'TikTok'], optional)",
                        },
                        campaign_tone: {
                            type: "string",
                            enum: ["professional", "casual", "humorous", "edgy", "inspirational"],
                            description: "Tone/style for campaign content (optional, defaults to 'casual')",
                            default: "casual",
                        },
                        budget_credits: {
                            type: "number",
                            description: "Maximum budget in mock ADA credits (optional, defaults to 50)",
                            default: 50,
                        },
                    },
                    required: ["campaign_idea"],
                },
            },
            {
                name: "get_campaign_status",
                description: "Get the current status and progress of a marketing campaign execution",
                inputSchema: {
                    type: "object",
                    properties: {
                        workflow_id: {
                            type: "string",
                            description: "Unique identifier of the campaign workflow",
                        },
                    },
                    required: ["workflow_id"],
                },
            },
            {
                name: "register_agent",
                description: "Register a new specialized AI agent in the network with its capabilities and pricing",
                inputSchema: {
                    type: "object",
                    properties: {
                        agent_name: {
                            type: "string",
                            description: "Name of the agent",
                        },
                        capabilities: {
                            type: "array",
                            items: { type: "string" },
                            description: "List of capabilities/skills the agent possesses",
                        },
                        endpoint: {
                            type: "string",
                            description: "API endpoint or MCP server address for the agent",
                        },
                        pricing: {
                            type: "object",
                            properties: {
                                per_task: { type: "number" },
                                per_hour: { type: "number" },
                                currency: { type: "string", default: "ADA" },
                            },
                            description: "Pricing structure for the agent",
                        },
                        wallet_address: {
                            type: "string",
                            description: "Cardano wallet address for receiving payments",
                        },
                    },
                    required: ["agent_name", "capabilities", "endpoint", "wallet_address"],
                },
            },
            {
                name: "discover_agents",
                description: "Find suitable SokoSumi marketing agents for a specific task. Available capabilities: meme_creation, viral_content, audience_research, consumer_insights, social_analytics, instagram_analysis, web_research, content_strategy",
                inputSchema: {
                    type: "object",
                    properties: {
                        required_capabilities: {
                            type: "array",
                            items: { type: "string" },
                            description: "Marketing capabilities needed (e.g., ['meme_creation', 'social_analytics'])",
                        },
                        max_budget: {
                            type: "number",
                            description: "Maximum budget in mock ADA credits (optional)",
                        },
                        min_reputation: {
                            type: "number",
                            description: "Minimum reputation score (0-1, optional)",
                        },
                    },
                    required: ["required_capabilities"],
                },
            },
            {
                name: "validate_agent_output",
                description: "Validate the output from an agent execution against quality criteria",
                inputSchema: {
                    type: "object",
                    properties: {
                        task_id: {
                            type: "string",
                            description: "Task identifier",
                        },
                        agent_id: {
                            type: "string",
                            description: "Agent identifier",
                        },
                        output: {
                            type: "object",
                            description: "Output data from the agent",
                        },
                        validation_criteria: {
                            type: "array",
                            items: { type: "string" },
                            description: "Criteria to validate against",
                        },
                    },
                    required: ["task_id", "agent_id", "output"],
                },
            },
            {
                name: "get_agent_reputation",
                description: "Get the reputation score and performance history of an agent",
                inputSchema: {
                    type: "object",
                    properties: {
                        agent_id: {
                            type: "string",
                            description: "Agent identifier",
                        },
                    },
                    required: ["agent_id"],
                },
            },
            {
                name: "execute_payment",
                description: "Execute a micropayment to an agent on Cardano blockchain",
                inputSchema: {
                    type: "object",
                    properties: {
                        agent_id: {
                            type: "string",
                            description: "Agent identifier",
                        },
                        amount: {
                            type: "number",
                            description: "Amount in ADA",
                        },
                        task_id: {
                            type: "string",
                            description: "Associated task identifier",
                        },
                    },
                    required: ["agent_id", "amount", "task_id"],
                },
            },
            {
                name: "log_workflow_event",
                description: "Log an important workflow event to Cardano blockchain for transparency",
                inputSchema: {
                    type: "object",
                    properties: {
                        workflow_id: {
                            type: "string",
                            description: "Workflow identifier",
                        },
                        event_type: {
                            type: "string",
                            enum: ["started", "task_assigned", "task_completed", "validated", "payment", "completed", "failed"],
                            description: "Type of event",
                        },
                        event_data: {
                            type: "object",
                            description: "Event-specific data",
                        },
                    },
                    required: ["workflow_id", "event_type", "event_data"],
                },
            },
            {
                name: "negotiate_with_agent",
                description: "Negotiate pricing and terms with an agent for a specific task",
                inputSchema: {
                    type: "object",
                    properties: {
                        agent_id: {
                            type: "string",
                            description: "Agent identifier",
                        },
                        task_requirements: {
                            type: "object",
                            description: "Task requirements and specifications",
                        },
                        proposed_budget: {
                            type: "number",
                            description: "Proposed budget for the task",
                        },
                    },
                    required: ["agent_id", "task_requirements"],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "create_marketing_campaign": {
                const campaignGoal = args.product_name
                    ? `${args.campaign_idea} for ${args.product_name}`
                    : args.campaign_idea;
                const campaignContext = [
                    campaignGoal,
                    args.target_audience ? `Target: ${args.target_audience}` : '',
                    args.platforms ? `Platforms: ${args.platforms.join(', ')}` : '',
                    args.campaign_tone ? `Tone: ${args.campaign_tone}` : '',
                ].filter(Boolean).join(' | ');
                const workflow = await orchestrator.createWorkflow({
                    goal: campaignContext,
                    budget: args.budget_credits || 50,
                    deadline: undefined,
                    qualityThreshold: 0.8,
                });
                await cardanoIntegration.logWorkflowEvent(workflow.id, "started", {
                    campaign_idea: args.campaign_idea,
                    product_name: args.product_name,
                    target_audience: args.target_audience,
                    platforms: args.platforms,
                    timestamp: new Date().toISOString(),
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                campaign_id: workflow.id,
                                campaign_idea: args.campaign_idea,
                                decomposed_tasks: workflow.tasks.map(t => ({
                                    id: t.id,
                                    title: t.title,
                                    description: t.description,
                                    estimated_cost: t.estimatedCost,
                                    status: t.status,
                                })),
                                estimated_total_cost: workflow.estimatedCost,
                                assigned_sokosumi_agents: workflow.agentAssignments,
                                message: "Marketing campaign created! SokoSumi agents assigned and execution starting...",
                            }, null, 2),
                        },
                    ],
                };
            }
            case "get_campaign_status": {
                const status = await orchestrator.getWorkflowStatus(args.workflow_id);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                campaign_id: args.workflow_id,
                                status: status.status,
                                progress: status.progress,
                                tasks: status.tasks,
                                cost_spent: status.totalCost,
                                agents_used: status.agentAssignments,
                            }, null, 2),
                        },
                    ],
                };
            }
            case "register_agent": {
                const agent = await agentRegistry.registerAgent({
                    name: args.agent_name,
                    capabilities: args.capabilities,
                    endpoint: args.endpoint,
                    pricing: args.pricing,
                    walletAddress: args.wallet_address,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                agent_id: agent.id,
                                message: "Agent successfully registered in the network",
                            }, null, 2),
                        },
                    ],
                };
            }
            case "discover_agents": {
                const agents = await agentRegistry.discoverAgents({
                    requiredCapabilities: args.required_capabilities,
                    maxBudget: args.max_budget,
                    minReputation: args.min_reputation,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                found_agents: agents.length,
                                agents: agents.map(a => ({
                                    id: a.id,
                                    name: a.name,
                                    capabilities: a.capabilities,
                                    reputation: a.reputation,
                                    pricing: a.pricing,
                                })),
                            }, null, 2),
                        },
                    ],
                };
            }
            case "validate_agent_output": {
                const validation = await orchestrator.validateOutput({
                    taskId: args.task_id,
                    agentId: args.agent_id,
                    output: args.output,
                    criteria: args.validation_criteria,
                });
                await reputationSystem.recordTaskCompletion(args.agent_id, args.task_id, validation.passed, validation.qualityScore);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(validation, null, 2),
                        },
                    ],
                };
            }
            case "get_agent_reputation": {
                const reputation = await reputationSystem.getAgentReputation(args.agent_id);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(reputation, null, 2),
                        },
                    ],
                };
            }
            case "execute_payment": {
                const payment = await cardanoIntegration.executePayment({
                    agentId: args.agent_id,
                    amount: args.amount,
                    taskId: args.task_id,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                transaction_hash: payment.txHash,
                                amount: args.amount,
                                message: "Payment executed successfully",
                            }, null, 2),
                        },
                    ],
                };
            }
            case "log_workflow_event": {
                await cardanoIntegration.logWorkflowEvent(args.workflow_id, args.event_type, args.event_data);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                message: "Event logged on Cardano blockchain",
                            }, null, 2),
                        },
                    ],
                };
            }
            case "negotiate_with_agent": {
                const negotiation = await orchestrator.negotiateWithAgent({
                    agentId: args.agent_id,
                    taskRequirements: args.task_requirements,
                    proposedBudget: args.proposed_budget,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(negotiation, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        logger.error(`Error executing tool ${name}:`, error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: true,
                        message: error instanceof Error ? error.message : "Unknown error occurred",
                    }),
                },
            ],
            isError: true,
        };
    }
});
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "workflow://active",
                name: "Active Marketing Campaigns",
                description: "List of all currently active marketing campaigns",
                mimeType: "application/json",
            },
            {
                uri: "agents://registry",
                name: "SokoSumi Agent Registry",
                description: "Registry of all available SokoSumi marketing agents",
                mimeType: "application/json",
            },
        ],
    };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    if (uri === "workflow://active") {
        const workflows = await orchestrator.getActiveWorkflows();
        return {
            contents: [
                {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify(workflows, null, 2),
                },
            ],
        };
    }
    else if (uri === "agents://registry") {
        const agents = await agentRegistry.getAllAgents();
        return {
            contents: [
                {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify(agents, null, 2),
                },
            ],
        };
    }
    throw new Error(`Unknown resource: ${uri}`);
});
async function main() {
    logger.info("Starting AI Marketing Campaign Orchestrator with SokoSumi agents...");
    await cardanoIntegration.initialize();
    await agentRegistry.initialize();
    await reputationSystem.initialize();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("AI Marketing Campaign Orchestrator is running. Ready to create campaigns!");
}
main().catch((error) => {
    logger.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map