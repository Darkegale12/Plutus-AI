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
export declare class ReputationSystem {
    private reputationRecords;
    private agentRegistry;
    private cardanoIntegration;
    constructor();
    initialize(): Promise<void>;
    recordTaskCompletion(agentId: string, taskId: string, completed: boolean, qualityScore: number, feedback?: string): Promise<void>;
    getAgentReputation(agentId: string): Promise<AgentReputation>;
    private calculateOverallScore;
    private calculateTier;
    private awardBadges;
    getLeaderboard(limit?: number): Promise<any[]>;
    penalizeAgent(agentId: string, reason: string, severity: number): Promise<void>;
    rewardAgent(agentId: string, reason: string, bonus: number): Promise<void>;
}
//# sourceMappingURL=ReputationSystem.d.ts.map