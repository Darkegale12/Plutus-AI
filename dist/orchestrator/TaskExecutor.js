import { logger } from '../utils/logger.js';
import { AgentRegistry } from '../registry/AgentRegistry.js';
import { SokoSumiAdapter } from '../adapters/SokoSumiAdapter.js';
export class TaskExecutor {
    agentRegistry;
    sokosumiAdapter;
    constructor() {
        this.agentRegistry = new AgentRegistry();
        this.sokosumiAdapter = new SokoSumiAdapter();
    }
    async initialize() {
        await this.sokosumiAdapter.initialize();
    }
    async execute(task, agentId, workflow) {
        logger.info(`Executing task ${task.id} with agent ${agentId}`);
        const agent = await this.agentRegistry.getAgent(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        try {
            const result = await this.callSokoSumiAgent(agent, task, workflow);
            workflow.actualCost += agent.pricing.per_task || 0;
            return result;
        }
        catch (error) {
            logger.error(`Failed to execute task ${task.id}:`, error);
            throw error;
        }
    }
    async callSokoSumiAgent(agent, task, workflow) {
        logger.info(`Calling SokoSumi agent ${agent.name} for task: ${task.title}`);
        try {
            const inputData = this.prepareAgentInput(task, workflow);
            const result = await this.sokosumiAdapter.executeAgentTask(agent.id, inputData, task.title);
            return {
                task_id: task.id,
                agent_id: agent.id,
                status: 'completed',
                output: {
                    summary: `Completed ${task.title} using ${agent.name}`,
                    result: result,
                    details: task.description,
                    metadata: {
                        agent_name: agent.name,
                        execution_time: Date.now(),
                        quality_indicators: {
                            completeness: 0.9,
                            accuracy: 0.9,
                        },
                    },
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            logger.error(`SokoSumi agent call failed for task ${task.id}:`, error);
            throw error;
        }
    }
    prepareAgentInput(task, workflow) {
        const baseInput = {
            task_description: task.description,
            task_title: task.title,
            workflow_goal: workflow.goal,
            required_capabilities: task.requiredCapabilities,
        };
        const capabilities = task.requiredCapabilities;
        if (capabilities.includes('meme_creation') || capabilities.includes('viral_content')) {
            return {
                ...baseInput,
                meme_idea: task.description,
                generation_mode: 'Image Mode',
                style: 'humorous',
                language: 'en',
            };
        }
        if (capabilities.includes('audience_research') || capabilities.includes('consumer_insights')) {
            return {
                ...baseInput,
                research_query: task.description,
                target_audience: workflow.goal,
                depth: 'comprehensive',
            };
        }
        if (capabilities.includes('social_analytics') || capabilities.includes('instagram_analysis')) {
            return {
                ...baseInput,
                platform: 'instagram',
                analysis_type: 'engagement',
                metrics_needed: ['reach', 'engagement_rate', 'best_performing_content'],
            };
        }
        if (capabilities.includes('web_research') || capabilities.includes('content_strategy')) {
            return {
                ...baseInput,
                research_topic: task.description,
                search_depth: 'detailed',
                sources_needed: 5,
            };
        }
        return baseInput;
    }
}
//# sourceMappingURL=TaskExecutor.js.map