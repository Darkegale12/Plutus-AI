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
export declare class AgentRegistry {
    private agents;
    initialize(): Promise<void>;
    registerAgent(params: {
        id?: string;
        name: string;
        capabilities: string[];
        endpoint: string;
        pricing: any;
        walletAddress: string;
    }): Promise<Agent>;
    discoverAgents(query: AgentDiscoveryQuery): Promise<Agent[]>;
    getAgent(agentId: string): Promise<Agent | undefined>;
    getAllAgents(): Promise<Agent[]>;
    updateAgentReputation(agentId: string, qualityScore: number, taskCompleted: boolean): Promise<void>;
    updateAgentStatus(agentId: string, status: Agent['status']): Promise<void>;
    private registerDefaultAgents;
}
//# sourceMappingURL=AgentRegistry.d.ts.map