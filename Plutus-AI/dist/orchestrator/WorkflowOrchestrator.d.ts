export interface WorkflowConfig {
    goal: string;
    budget?: number;
    deadline?: string;
    qualityThreshold: number;
}
export interface Task {
    id: string;
    title: string;
    description: string;
    requiredCapabilities: string[];
    estimatedCost: number;
    priority: number;
    dependencies: string[];
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
    assignedAgent?: string;
    output?: any;
    validationScore?: number;
}
export interface Workflow {
    id: string;
    goal: string;
    tasks: Task[];
    status: 'created' | 'planning' | 'executing' | 'validating' | 'completed' | 'failed';
    estimatedCost: number;
    actualCost: number;
    agentAssignments: Map<string, string>;
    startTime: Date;
    endTime?: Date;
    budget?: number;
    deadline?: string;
    qualityThreshold: number;
}
export declare class WorkflowOrchestrator {
    private workflows;
    private taskDecomposer;
    private taskExecutor;
    private outputValidator;
    private agentRegistry;
    constructor();
    createWorkflow(config: WorkflowConfig): Promise<Workflow>;
    private executeWorkflow;
    private executeTask;
    private retryTask;
    private buildExecutionQueue;
    private enrichTasks;
    private estimateTaskCost;
    private assignAgents;
    private selectBestAgent;
    getWorkflowStatus(workflowId: string): Promise<any>;
    getActiveWorkflows(): Promise<Workflow[]>;
    validateOutput(params: {
        taskId: string;
        agentId: string;
        output: any;
        criteria?: string[];
    }): Promise<any>;
    negotiateWithAgent(params: {
        agentId: string;
        taskRequirements: any;
        proposedBudget?: number;
    }): Promise<any>;
}
//# sourceMappingURL=WorkflowOrchestrator.d.ts.map