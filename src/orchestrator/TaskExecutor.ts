/**
 * Task Executor
 * 
 * Executes tasks by communicating with assigned agents via SokoSumi,
 * monitoring progress, and handling retries
 */

import { Task, Workflow } from './WorkflowOrchestrator.js';
import { logger } from '../utils/logger.js';
import { AgentRegistry } from '../registry/AgentRegistry.js';
import { SokoSumiAdapter } from '../adapters/SokoSumiAdapter.js';

export class TaskExecutor {
  private agentRegistry: AgentRegistry;
  private sokosumiAdapter: SokoSumiAdapter;

  constructor() {
    this.agentRegistry = new AgentRegistry();
    this.sokosumiAdapter = new SokoSumiAdapter();
  }

  async initialize(): Promise<void> {
    await this.sokosumiAdapter.initialize();
  }

  /**
   * Execute a task with the assigned agent via SokoSumi
   */
  async execute(task: Task, agentId: string, workflow: Workflow): Promise<any> {
    logger.info(`Executing task ${task.id} with agent ${agentId}`);

    const agent = await this.agentRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      // Call the agent via SokoSumi
      const result = await this.callSokoSumiAgent(agent, task, workflow);

      // Update actual cost (convert credits to ADA equivalent)
      workflow.actualCost += agent.pricing.per_task || 0;

      return result;
    } catch (error) {
      logger.error(`Failed to execute task ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Call a SokoSumi agent to execute a task
   */
  private async callSokoSumiAgent(agent: any, task: Task, workflow: Workflow): Promise<any> {
    logger.info(`Calling SokoSumi agent ${agent.name} for task: ${task.title}`);

    try {
      // Prepare input data based on task type
      const inputData = this.prepareAgentInput(task, workflow);

      // Execute task via SokoSumi adapter
      const result = await this.sokosumiAdapter.executeAgentTask(
        agent.id,
        inputData,
        task.title
      );

      // Format the result
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
    } catch (error) {
      logger.error(`SokoSumi agent call failed for task ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Prepare input data for SokoSumi agent based on task type
   */
  private prepareAgentInput(task: Task, workflow: Workflow): any {
    // Base input with task context
    const baseInput = {
      task_description: task.description,
      task_title: task.title,
      workflow_goal: workflow.goal,
      required_capabilities: task.requiredCapabilities,
    };

    // Customize input based on agent capabilities
    const capabilities = task.requiredCapabilities;

    // Meme Creation Agent
    if (capabilities.includes('meme_creation') || capabilities.includes('viral_content')) {
      return {
        ...baseInput,
        meme_idea: task.description,
        generation_mode: 'Image Mode',
        style: 'humorous',
        language: 'en',
      };
    }

    // Consumer Insights Agent
    if (capabilities.includes('audience_research') || capabilities.includes('consumer_insights')) {
      return {
        ...baseInput,
        research_query: task.description,
        target_audience: workflow.goal,
        depth: 'comprehensive',
      };
    }

    // Social Analytics Agent
    if (capabilities.includes('social_analytics') || capabilities.includes('instagram_analysis')) {
      return {
        ...baseInput,
        platform: 'instagram',
        analysis_type: 'engagement',
        metrics_needed: ['reach', 'engagement_rate', 'best_performing_content'],
      };
    }

    // Content Research Agent
    if (capabilities.includes('web_research') || capabilities.includes('content_strategy')) {
      return {
        ...baseInput,
        research_topic: task.description,
        search_depth: 'detailed',
        sources_needed: 5,
      };
    }

    // Generic input for other agents
    return baseInput;
  }
}
