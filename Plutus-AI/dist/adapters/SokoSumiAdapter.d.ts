export interface SokoSumiJobParams {
    agentId: string;
    inputData: any;
    maxAcceptedCredits?: number;
    name?: string;
}
export interface SokoSumiJobResult {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
    startedAt?: string;
    completedAt?: string;
    price?: {
        credits: number;
        includedFee: number;
    };
}
export declare class SokoSumiAdapter {
    private mcpEndpoint;
    private apiKey;
    private network;
    constructor();
    initialize(): Promise<void>;
    private testConnection;
    createJob(params: SokoSumiJobParams): Promise<SokoSumiJobResult>;
    getJobStatus(jobId: string): Promise<SokoSumiJobResult>;
    waitForJobCompletion(jobId: string, timeoutMs?: number, pollIntervalMs?: number): Promise<SokoSumiJobResult>;
    executeAgentTask(agentId: string, inputData: any, taskName?: string): Promise<any>;
    getAvailableAgents(): Promise<any[]>;
    private sleep;
    getMCPEndpointURL(): string;
}
//# sourceMappingURL=SokoSumiAdapter.d.ts.map