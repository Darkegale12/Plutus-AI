import { logger } from '../utils/logger.js';
import { AgentRegistry } from '../registry/AgentRegistry.js';
import { CardanoIntegration } from '../blockchain/CardanoIntegration.js';
export class ReputationSystem {
    reputationRecords = new Map();
    agentRegistry;
    cardanoIntegration;
    constructor() {
        this.agentRegistry = new AgentRegistry();
        this.cardanoIntegration = new CardanoIntegration();
    }
    async initialize() {
        logger.info('Initializing Reputation System...');
        logger.info('Reputation System initialized');
    }
    async recordTaskCompletion(agentId, taskId, completed, qualityScore, feedback) {
        logger.info(`Recording task completion for agent ${agentId}: ${completed ? 'SUCCESS' : 'FAILED'}`);
        const record = {
            agentId,
            taskId,
            completed,
            qualityScore,
            timestamp: new Date(),
            feedback,
        };
        if (!this.reputationRecords.has(agentId)) {
            this.reputationRecords.set(agentId, []);
        }
        this.reputationRecords.get(agentId).push(record);
        await this.agentRegistry.updateAgentReputation(agentId, qualityScore, completed);
        try {
            await this.cardanoIntegration.logWorkflowEvent(`reputation-${agentId}`, 'task_completed', {
                agent_id: agentId,
                task_id: taskId,
                completed,
                quality_score: qualityScore,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger.warn('Failed to log reputation event on-chain:', error);
        }
    }
    async getAgentReputation(agentId) {
        logger.info(`Fetching reputation for agent ${agentId}`);
        const records = this.reputationRecords.get(agentId) || [];
        const agent = await this.agentRegistry.getAgent(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        const totalTasks = records.length;
        const successfulTasks = records.filter(r => r.completed).length;
        const failedTasks = totalTasks - successfulTasks;
        const averageQuality = totalTasks > 0
            ? records.reduce((sum, r) => sum + r.qualityScore, 0) / totalTasks
            : 0;
        const successRate = totalTasks > 0 ? successfulTasks / totalTasks : 0;
        const recentRecords = records.slice(-10);
        const recentPerformance = recentRecords.length > 0
            ? recentRecords.reduce((sum, r) => sum + (r.completed ? 1 : 0), 0) / recentRecords.length
            : 0;
        const overallScore = this.calculateOverallScore({
            successRate,
            averageQuality,
            recentPerformance,
            totalTasks,
        });
        const tier = this.calculateTier(overallScore, totalTasks);
        const badges = this.awardBadges(agent, records);
        let onChainVerified = false;
        try {
            const _onChainData = await this.cardanoIntegration.getOnChainReputation(agentId);
            onChainVerified = true;
        }
        catch (error) {
            logger.warn('Could not verify on-chain reputation');
        }
        return {
            agent_id: agentId,
            overall_score: overallScore,
            total_tasks: totalTasks,
            successful_tasks: successfulTasks,
            failed_tasks: failedTasks,
            average_quality: averageQuality,
            success_rate: successRate,
            recent_performance: recentPerformance,
            on_chain_verified: onChainVerified,
            reputation_history: records.slice(-20),
            badges,
            tier,
        };
    }
    calculateOverallScore(metrics) {
        const weights = {
            successRate: 0.3,
            averageQuality: 0.35,
            recentPerformance: 0.25,
            experience: 0.1,
        };
        const experienceFactor = Math.min(1, Math.log10(metrics.totalTasks + 1) / 2);
        const score = metrics.successRate * weights.successRate +
            metrics.averageQuality * weights.averageQuality +
            metrics.recentPerformance * weights.recentPerformance +
            experienceFactor * weights.experience;
        return Math.min(1, Math.max(0, score));
    }
    calculateTier(overallScore, totalTasks) {
        if (totalTasks < 5)
            return 'bronze';
        if (overallScore >= 0.95 && totalTasks >= 50)
            return 'platinum';
        if (overallScore >= 0.85 && totalTasks >= 20)
            return 'gold';
        if (overallScore >= 0.75 && totalTasks >= 10)
            return 'silver';
        return 'bronze';
    }
    awardBadges(agent, records) {
        const badges = [];
        if (records.length >= 100)
            badges.push('Veteran');
        else if (records.length >= 50)
            badges.push('Expert');
        else if (records.length >= 10)
            badges.push('Experienced');
        const avgQuality = records.length > 0
            ? records.reduce((sum, r) => sum + r.qualityScore, 0) / records.length
            : 0;
        if (avgQuality >= 0.95)
            badges.push('Quality Master');
        else if (avgQuality >= 0.90)
            badges.push('High Quality');
        const recentRecords = records.slice(-10);
        const recentSuccess = recentRecords.every(r => r.completed);
        if (recentSuccess && recentRecords.length >= 10) {
            badges.push('Perfect Streak');
        }
        if (agent.averageResponseTime && agent.averageResponseTime < 3600) {
            badges.push('Fast Responder');
        }
        if (agent.capabilities.length >= 5) {
            badges.push('Multi-Skilled');
        }
        return badges;
    }
    async getLeaderboard(limit = 10) {
        logger.info(`Generating leaderboard (top ${limit})`);
        const allAgents = await this.agentRegistry.getAllAgents();
        const leaderboard = await Promise.all(allAgents.map(async (agent) => {
            try {
                const reputation = await this.getAgentReputation(agent.id);
                return {
                    agent_id: agent.id,
                    agent_name: agent.name,
                    overall_score: reputation.overall_score,
                    tier: reputation.tier,
                    total_tasks: reputation.total_tasks,
                    badges: reputation.badges,
                };
            }
            catch (error) {
                return null;
            }
        }));
        const validLeaderboard = leaderboard
            .filter(entry => entry !== null)
            .sort((a, b) => b.overall_score - a.overall_score)
            .slice(0, limit);
        return validLeaderboard;
    }
    async penalizeAgent(agentId, reason, severity) {
        logger.warn(`Penalizing agent ${agentId}: ${reason}`);
        const agent = await this.agentRegistry.getAgent(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        const penalty = severity * 0.1;
        const newReputation = Math.max(0, agent.reputation - penalty);
        await this.agentRegistry.updateAgentReputation(agentId, newReputation, false);
        await this.cardanoIntegration.logWorkflowEvent(`penalty-${agentId}`, 'agent_penalized', {
            agent_id: agentId,
            reason,
            severity,
            penalty_amount: penalty,
            timestamp: new Date().toISOString(),
        });
    }
    async rewardAgent(agentId, reason, bonus) {
        logger.info(`Rewarding agent ${agentId}: ${reason}`);
        const agent = await this.agentRegistry.getAgent(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        const newReputation = Math.min(1, agent.reputation + bonus);
        await this.agentRegistry.updateAgentReputation(agentId, newReputation, true);
        await this.cardanoIntegration.logWorkflowEvent(`reward-${agentId}`, 'agent_rewarded', {
            agent_id: agentId,
            reason,
            bonus_amount: bonus,
            timestamp: new Date().toISOString(),
        });
    }
}
//# sourceMappingURL=ReputationSystem.js.map