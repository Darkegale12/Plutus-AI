/**
 * Agent Registry
 * 
 * Registry for managing specialized AI agents on the Masumi Network.
 * Handles agent registration, discovery, and capability matching.
 * Integrated with SokoSumi marketplace for marketing campaign agents.
 */

import { logger } from '../utils/logger.js';

export interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  endpoint: string;
  pricing: {
    per_task?: number;
    per_hour?: number;
    currency: string;
  };
  walletAddress: string;
  reputation: number;
  totalTasksCompleted: number;
  averageQualityScore: number;
  registeredAt: Date;
  lastActiveAt: Date;
  status: 'active' | 'inactive' | 'busy';
}

export interface AgentDiscoveryQuery {
  requiredCapabilities: string[];
  maxBudget?: number;
  minReputation?: number;
  excludeAgents?: string[];
}

export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  async initialize(): Promise<void> {
    logger.info('Initializing Agent Registry...');
    
    // Register some default agents for testing
    await this.registerDefaultAgents();
    
    logger.info(`Agent Registry initialized with ${this.agents.size} agents`);
  }

  /**
   * Register a new agent in the network
   */
  async registerAgent(params: {
    id?: string;
    name: string;
    capabilities: string[];
    endpoint: string;
    pricing: any;
    walletAddress: string;
  }): Promise<Agent> {
    logger.info(`Registering agent: ${params.name}`);

    const agent: Agent = {
      id: params.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: params.name,
      capabilities: params.capabilities,
      endpoint: params.endpoint,
      pricing: {
        ...params.pricing,
        currency: params.pricing.currency || 'ADA',
      },
      walletAddress: params.walletAddress,
      reputation: 0.5, // Start with neutral reputation
      totalTasksCompleted: 0,
      averageQualityScore: 0,
      registeredAt: new Date(),
      lastActiveAt: new Date(),
      status: 'active',
    };

    this.agents.set(agent.id, agent);

    logger.info(`Agent ${params.name} registered with ID: ${agent.id}`);

    return agent;
  }

  /**
   * Discover agents matching requirements
   */
  async discoverAgents(query: AgentDiscoveryQuery): Promise<Agent[]> {
    logger.info(`Discovering agents for capabilities: ${query.requiredCapabilities.join(', ')}`);

    const matchingAgents: Agent[] = [];

    for (const agent of this.agents.values()) {
      // Skip excluded agents
      if (query.excludeAgents && query.excludeAgents.includes(agent.id)) {
        continue;
      }

      // Skip inactive agents
      if (agent.status === 'inactive') {
        continue;
      }

      // Check capability match
      const hasAllCapabilities = query.requiredCapabilities.every(cap =>
        agent.capabilities.includes(cap)
      );

      if (!hasAllCapabilities) {
        continue;
      }

      // Check reputation
      if (query.minReputation && agent.reputation < query.minReputation) {
        continue;
      }

      // Check budget
      if (query.maxBudget && agent.pricing.per_task) {
        if (agent.pricing.per_task > query.maxBudget) {
          continue;
        }
      }

      matchingAgents.push(agent);
    }

    // Sort by reputation (descending)
    matchingAgents.sort((a, b) => b.reputation - a.reputation);

    logger.info(`Found ${matchingAgents.length} matching agents`);

    return matchingAgents;
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<Agent | undefined> {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  /**
   * Update agent reputation
   */
  async updateAgentReputation(
    agentId: string,
    qualityScore: number,
    taskCompleted: boolean
  ): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (taskCompleted) {
      agent.totalTasksCompleted++;
      
      // Update average quality score
      const totalScore = agent.averageQualityScore * (agent.totalTasksCompleted - 1) + qualityScore;
      agent.averageQualityScore = totalScore / agent.totalTasksCompleted;

      // Update reputation (weighted average of historical reputation and new score)
      agent.reputation = (agent.reputation * 0.7) + (qualityScore * 0.3);
    } else {
      // Penalize reputation for failed tasks
      agent.reputation = agent.reputation * 0.9;
    }

    agent.lastActiveAt = new Date();

    logger.info(`Updated reputation for agent ${agent.name}: ${agent.reputation.toFixed(2)}`);
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId: string, status: Agent['status']): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.status = status;
    agent.lastActiveAt = new Date();
  }

  /**
   * Register default agents for marketing campaigns
   * Using SokoSumi marketplace agents
   */
  private async registerDefaultAgents(): Promise<void> {
    const defaultAgents = [
      {
        id: 'cmcz2rqzq1ywg7n13zw6fevf3', // SokoSumi Agent ID
        name: 'MemeCreatorAgent',
        capabilities: ['meme_creation', 'viral_content', 'multilingual', 'social_media', 'humor', 'visual_content'],
        endpoint: 'https://mcp.sokosumi.com/mcp',
        pricing: { per_task: 7.0 },
        walletAddress: 'addr_test1qz_sokosumi_meme',
        reputation: 0.95,
        totalTasks: 160,
      },
      {
        id: 'cmevimm8f028djy049wsx8vip', // SokoSumi Agent ID
        name: 'ConsumerInsightsAgent',
        capabilities: ['audience_research', 'consumer_insights', 'market_analysis', 'demographics', 'psychographics'],
        endpoint: 'https://mcp.sokosumi.com/mcp',
        pricing: { per_task: 3.0 },
        walletAddress: 'addr_test1qx_sokosumi_insights',
        reputation: 0.92,
        totalTasks: 85,
      },
      {
        id: 'cmcx85r0n7v938e14sv66qqy2', // SokoSumi Agent ID
        name: 'SocialAnalyticsAgent',
        capabilities: ['social_analytics', 'instagram_analysis', 'engagement_metrics', 'content_analysis', 'performance_tracking'],
        endpoint: 'https://mcp.sokosumi.com/mcp',
        pricing: { per_task: 9.0 },
        walletAddress: 'addr_test1qy_sokosumi_analytics',
        reputation: 0.89,
        totalTasks: 72,
      },
      {
        id: 'cmcx5y0st7ham8e14q9ja3zyn', // SokoSumi Agent ID
        name: 'ContentResearchAgent',
        capabilities: ['web_research', 'content_strategy', 'competitive_analysis', 'trend_analysis', 'market_intelligence'],
        endpoint: 'https://mcp.sokosumi.com/mcp',
        pricing: { per_task: 3.0 },
        walletAddress: 'addr_test1qw_sokosumi_research',
        reputation: 0.93,
        totalTasks: 94,
      },
    ];

    for (const agentData of defaultAgents) {
      const agent: Agent = {
        id: agentData.id, // Use SokoSumi agent ID
        name: agentData.name,
        capabilities: agentData.capabilities,
        endpoint: agentData.endpoint,
        pricing: {
          per_task: agentData.pricing.per_task,
          currency: 'ADA', // Mock ADA equivalent of SokoSumi credits
        },
        walletAddress: agentData.walletAddress,
        reputation: agentData.reputation,
        totalTasksCompleted: agentData.totalTasks,
        averageQualityScore: agentData.reputation,
        registeredAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
        lastActiveAt: new Date(),
        status: 'active',
      };

      this.agents.set(agent.id, agent);
    }
    
    logger.info(`Registered ${this.agents.size} SokoSumi marketing agents`);
  }
}
