import { logger } from '../utils/logger.js';
export class AgentRegistry {
    agents = new Map();
    async initialize() {
        logger.info('Initializing Agent Registry...');
        await this.registerDefaultAgents();
        logger.info(`Agent Registry initialized with ${this.agents.size} agents`);
    }
    async registerAgent(params) {
        logger.info(`Registering agent: ${params.name}`);
        const agent = {
            id: params.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: params.name,
            capabilities: params.capabilities,
            endpoint: params.endpoint,
            pricing: {
                ...params.pricing,
                currency: params.pricing.currency || 'ADA',
            },
            walletAddress: params.walletAddress,
            reputation: 0.5,
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
    async discoverAgents(query) {
        logger.info(`Discovering agents for capabilities: ${query.requiredCapabilities.join(', ')}`);
        const matchingAgents = [];
        for (const agent of this.agents.values()) {
            if (query.excludeAgents && query.excludeAgents.includes(agent.id)) {
                continue;
            }
            if (agent.status === 'inactive') {
                continue;
            }
            const hasAllCapabilities = query.requiredCapabilities.every(cap => agent.capabilities.includes(cap));
            if (!hasAllCapabilities) {
                continue;
            }
            if (query.minReputation && agent.reputation < query.minReputation) {
                continue;
            }
            if (query.maxBudget && agent.pricing.per_task) {
                if (agent.pricing.per_task > query.maxBudget) {
                    continue;
                }
            }
            matchingAgents.push(agent);
        }
        matchingAgents.sort((a, b) => b.reputation - a.reputation);
        logger.info(`Found ${matchingAgents.length} matching agents`);
        return matchingAgents;
    }
    async getAgent(agentId) {
        return this.agents.get(agentId);
    }
    async getAllAgents() {
        return Array.from(this.agents.values());
    }
    async updateAgentReputation(agentId, qualityScore, taskCompleted) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        if (taskCompleted) {
            agent.totalTasksCompleted++;
            const totalScore = agent.averageQualityScore * (agent.totalTasksCompleted - 1) + qualityScore;
            agent.averageQualityScore = totalScore / agent.totalTasksCompleted;
            agent.reputation = (agent.reputation * 0.7) + (qualityScore * 0.3);
        }
        else {
            agent.reputation = agent.reputation * 0.9;
        }
        agent.lastActiveAt = new Date();
        logger.info(`Updated reputation for agent ${agent.name}: ${agent.reputation.toFixed(2)}`);
    }
    async updateAgentStatus(agentId, status) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        agent.status = status;
        agent.lastActiveAt = new Date();
    }
    async registerDefaultAgents() {
        const defaultAgents = [
            {
                id: 'cmcz2rqzq1ywg7n13zw6fevf3',
                name: 'MemeCreatorAgent',
                capabilities: ['meme_creation', 'viral_content', 'multilingual', 'social_media', 'humor', 'visual_content'],
                endpoint: 'https://mcp.sokosumi.com/mcp',
                pricing: { per_task: 7.0 },
                walletAddress: 'addr_test1qz_sokosumi_meme',
                reputation: 0.95,
                totalTasks: 160,
            },
            {
                id: 'cmevimm8f028djy049wsx8vip',
                name: 'ConsumerInsightsAgent',
                capabilities: ['audience_research', 'consumer_insights', 'market_analysis', 'demographics', 'psychographics'],
                endpoint: 'https://mcp.sokosumi.com/mcp',
                pricing: { per_task: 3.0 },
                walletAddress: 'addr_test1qx_sokosumi_insights',
                reputation: 0.92,
                totalTasks: 85,
            },
            {
                id: 'cmcx85r0n7v938e14sv66qqy2',
                name: 'SocialAnalyticsAgent',
                capabilities: ['social_analytics', 'instagram_analysis', 'engagement_metrics', 'content_analysis', 'performance_tracking'],
                endpoint: 'https://mcp.sokosumi.com/mcp',
                pricing: { per_task: 9.0 },
                walletAddress: 'addr_test1qy_sokosumi_analytics',
                reputation: 0.89,
                totalTasks: 72,
            },
            {
                id: 'cmcx5y0st7ham8e14q9ja3zyn',
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
            const agent = {
                id: agentData.id,
                name: agentData.name,
                capabilities: agentData.capabilities,
                endpoint: agentData.endpoint,
                pricing: {
                    per_task: agentData.pricing.per_task,
                    currency: 'ADA',
                },
                walletAddress: agentData.walletAddress,
                reputation: agentData.reputation,
                totalTasksCompleted: agentData.totalTasks,
                averageQualityScore: agentData.reputation,
                registeredAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
                lastActiveAt: new Date(),
                status: 'active',
            };
            this.agents.set(agent.id, agent);
        }
        logger.info(`Registered ${this.agents.size} SokoSumi marketing agents`);
    }
}
//# sourceMappingURL=AgentRegistry.js.map