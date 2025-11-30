/**
 * Task Decomposer
 * 
 * Breaks down marketing campaign goals into concrete,
 * actionable subtasks for SokoSumi agents
 * Specialized for marketing campaigns only
 */

import { Task } from './WorkflowOrchestrator.js';
import { logger } from '../utils/logger.js';

export class TaskDecomposer {
  /**
   * Decompose a high-level goal into subtasks
   */
  async decompose(goal: string): Promise<Task[]> {
    logger.info(`Decomposing goal: ${goal}`);

    // Use AI/LLM to analyze the goal and break it down
    // For now, using rule-based decomposition with common patterns
    const tasks = await this.analyzeAndDecompose(goal);

    logger.info(`Goal decomposed into ${tasks.length} tasks`);
    return tasks;
  }

  /**
   * Analyze goal and create marketing campaign task breakdown
   */
  private async analyzeAndDecompose(goal: string): Promise<Task[]> {
    // Always decompose as marketing campaign
    return this.decomposeMarketingCampaign(goal);
  }

  /**
   * Decompose marketing campaign goals using SokoSumi agents
   */
  private decomposeMarketingCampaign(goal: string): Task[] {
    const taskIdPrefix = `task-${Date.now()}`;
    
    return [
      {
        id: `${taskIdPrefix}-1`,
        title: 'Audience Research & Insights',
        description: `Conduct comprehensive audience research and consumer insights for: ${goal}`,
        requiredCapabilities: ['audience_research', 'consumer_insights', 'market_analysis'],
        estimatedCost: 3.0,
        priority: 0,
        dependencies: [],
        status: 'pending',
      },
      {
        id: `${taskIdPrefix}-2`,
        title: 'Content Strategy & Market Research',
        description: `Research market trends, competitor strategies, and develop content strategy for: ${goal}`,
        requiredCapabilities: ['web_research', 'content_strategy', 'competitive_analysis'],
        estimatedCost: 3.0,
        priority: 1,
        dependencies: [`${taskIdPrefix}-1`],
        status: 'pending',
      },
      {
        id: `${taskIdPrefix}-3`,
        title: 'Viral Content & Meme Creation',
        description: `Create engaging viral content and memes for: ${goal}`,
        requiredCapabilities: ['meme_creation', 'viral_content', 'social_media'],
        estimatedCost: 7.0,
        priority: 2,
        dependencies: [`${taskIdPrefix}-2`],
        status: 'pending',
      },
      {
        id: `${taskIdPrefix}-4`,
        title: 'Social Media Analytics Setup',
        description: `Analyze social media performance and setup analytics for: ${goal}`,
        requiredCapabilities: ['social_analytics', 'instagram_analysis', 'performance_tracking'],
        estimatedCost: 9.0,
        priority: 3,
        dependencies: [`${taskIdPrefix}-3`],
        status: 'pending',
      },
      {
        id: `${taskIdPrefix}-5`,
        title: 'Campaign Optimization',
        description: `Monitor campaign performance and provide optimization recommendations for: ${goal}`,
        requiredCapabilities: ['social_analytics', 'content_analysis', 'performance_tracking'],
        estimatedCost: 9.0,
        priority: 4,
        dependencies: [`${taskIdPrefix}-4`],
        status: 'pending',
      },
    ];
  }
}
