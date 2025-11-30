/**
 * Reputation System
 * 
 * Tracks and manages agent reputation based on:
 * - Task completion success rate
 * - Quality scores from validations
 * - Timeliness of delivery
 * - Client feedback
 * - On-chain verification
 */

import { logger } from '../utils/logger.js';
import { AgentRegistry } from '../registry/AgentRegistry.js';
import { CardanoIntegration } from '../blockchain/CardanoIntegration.js';

export interface ReputationRecord {
  agentId: string;
  taskId: string;
  completed: boolean;
  qualityScore: number;
  timestamp: Date;
  feedback?: string;
}

export interface AgentReputation {
  agent_id: string;
  overall_score: number;
  total_tasks: number;
  successful_tasks: number;
  failed_tasks: number;
  average_quality: number;
  success_rate: number;
  recent_performance: number;
  on_chain_verified: boolean;
  reputation_history: ReputationRecord[];
  badges: string[];
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export class ReputationSystem {
  private reputationRecords: Map<string, ReputationRecord[]> = new Map();
  private agentRegistry: AgentRegistry;
  private cardanoIntegration: CardanoIntegration;

  constructor() {
    this.agentRegistry = new AgentRegistry();
    this.cardanoIntegration = new CardanoIntegration();
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Reputation System...');
    logger.info('Reputation System initialized');
  }

  /**
   * Record task completion and update reputation
   */
  async recordTaskCompletion(
    agentId: string,
    taskId: string,
    completed: boolean,
    qualityScore: number,
    feedback?: string
  ): Promise<void> {
    logger.info(`Recording task completion for agent ${agentId}: ${completed ? 'SUCCESS' : 'FAILED'}`);

    const record: ReputationRecord = {
      agentId,
      taskId,
      completed,
      qualityScore,
      timestamp: new Date(),
      feedback,
    };

    // Store record
    if (!this.reputationRecords.has(agentId)) {
      this.reputationRecords.set(agentId, []);
    }
    this.reputationRecords.get(agentId)!.push(record);

    // Update agent reputation in registry
    await this.agentRegistry.updateAgentReputation(agentId, qualityScore, completed);

    // Log to blockchain for transparency
    try {
      await this.cardanoIntegration.logWorkflowEvent(
        `reputation-${agentId}`,
        'task_completed',
        {
          agent_id: agentId,
          task_id: taskId,
          completed,
          quality_score: qualityScore,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      logger.warn('Failed to log reputation event on-chain:', error);
    }
  }

  /**
   * Get comprehensive agent reputation
   */
  async getAgentReputation(agentId: string): Promise<AgentReputation> {
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

    // Calculate recent performance (last 10 tasks)
    const recentRecords = records.slice(-10);
    const recentPerformance = recentRecords.length > 0
      ? recentRecords.reduce((sum, r) => sum + (r.completed ? 1 : 0), 0) / recentRecords.length
      : 0;

    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      successRate,
      averageQuality,
      recentPerformance,
      totalTasks,
    });

    // Determine tier
    const tier = this.calculateTier(overallScore, totalTasks);

    // Award badges
    const badges = this.awardBadges(agent, records);

    // Check on-chain verification
    let onChainVerified = false;
    try {
      const _onChainData = await this.cardanoIntegration.getOnChainReputation(agentId);
      onChainVerified = true;
    } catch (error) {
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
      reputation_history: records.slice(-20), // Last 20 records
      badges,
      tier,
    };
  }

  /**
   * Calculate overall reputation score
   */
  private calculateOverallScore(metrics: {
    successRate: number;
    averageQuality: number;
    recentPerformance: number;
    totalTasks: number;
  }): number {
    // Weighted scoring algorithm
    const weights = {
      successRate: 0.3,
      averageQuality: 0.35,
      recentPerformance: 0.25,
      experience: 0.1,
    };

    // Experience factor (logarithmic growth)
    const experienceFactor = Math.min(1, Math.log10(metrics.totalTasks + 1) / 2);

    const score =
      metrics.successRate * weights.successRate +
      metrics.averageQuality * weights.averageQuality +
      metrics.recentPerformance * weights.recentPerformance +
      experienceFactor * weights.experience;

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate agent tier based on performance
   */
  private calculateTier(
    overallScore: number,
    totalTasks: number
  ): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (totalTasks < 5) return 'bronze';
    if (overallScore >= 0.95 && totalTasks >= 50) return 'platinum';
    if (overallScore >= 0.85 && totalTasks >= 20) return 'gold';
    if (overallScore >= 0.75 && totalTasks >= 10) return 'silver';
    return 'bronze';
  }

  /**
   * Award badges based on achievements
   */
  private awardBadges(agent: any, records: ReputationRecord[]): string[] {
    const badges: string[] = [];

    // Experience badges
    if (records.length >= 100) badges.push('Veteran');
    else if (records.length >= 50) badges.push('Expert');
    else if (records.length >= 10) badges.push('Experienced');

    // Quality badges
    const avgQuality = records.length > 0
      ? records.reduce((sum, r) => sum + r.qualityScore, 0) / records.length
      : 0;

    if (avgQuality >= 0.95) badges.push('Quality Master');
    else if (avgQuality >= 0.90) badges.push('High Quality');

    // Success streak
    const recentRecords = records.slice(-10);
    const recentSuccess = recentRecords.every(r => r.completed);
    if (recentSuccess && recentRecords.length >= 10) {
      badges.push('Perfect Streak');
    }

    // Fast responder
    if (agent.averageResponseTime && agent.averageResponseTime < 3600) {
      badges.push('Fast Responder');
    }

    // Specialist (if has specific domain expertise)
    if (agent.capabilities.length >= 5) {
      badges.push('Multi-Skilled');
    }

    return badges;
  }

  /**
   * Get leaderboard of top agents
   */
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    logger.info(`Generating leaderboard (top ${limit})`);

    const allAgents = await this.agentRegistry.getAllAgents();
    
    const leaderboard = await Promise.all(
      allAgents.map(async agent => {
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
        } catch (error) {
          return null;
        }
      })
    );

    // Filter out nulls and sort by score
    const validLeaderboard = leaderboard
      .filter(entry => entry !== null)
      .sort((a, b) => b!.overall_score - a!.overall_score)
      .slice(0, limit);

    return validLeaderboard;
  }

  /**
   * Penalize agent for poor performance
   */
  async penalizeAgent(agentId: string, reason: string, severity: number): Promise<void> {
    logger.warn(`Penalizing agent ${agentId}: ${reason}`);

    const agent = await this.agentRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Apply penalty to reputation
    const penalty = severity * 0.1; // severity: 1-10
    const newReputation = Math.max(0, agent.reputation - penalty);

    await this.agentRegistry.updateAgentReputation(agentId, newReputation, false);

    // Log penalty on-chain
    await this.cardanoIntegration.logWorkflowEvent(
      `penalty-${agentId}`,
      'agent_penalized',
      {
        agent_id: agentId,
        reason,
        severity,
        penalty_amount: penalty,
        timestamp: new Date().toISOString(),
      }
    );
  }

  /**
   * Reward agent for exceptional performance
   */
  async rewardAgent(agentId: string, reason: string, bonus: number): Promise<void> {
    logger.info(`Rewarding agent ${agentId}: ${reason}`);

    const agent = await this.agentRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Apply bonus to reputation
    const newReputation = Math.min(1, agent.reputation + bonus);

    await this.agentRegistry.updateAgentReputation(agentId, newReputation, true);

    // Log reward on-chain
    await this.cardanoIntegration.logWorkflowEvent(
      `reward-${agentId}`,
      'agent_rewarded',
      {
        agent_id: agentId,
        reason,
        bonus_amount: bonus,
        timestamp: new Date().toISOString(),
      }
    );
  }
}
