import { Task, Workflow } from './WorkflowOrchestrator.js';
export declare class TaskExecutor {
    private agentRegistry;
    private sokosumiAdapter;
    constructor();
    initialize(): Promise<void>;
    execute(task: Task, agentId: string, workflow: Workflow): Promise<any>;
    private callSokoSumiAgent;
    private prepareAgentInput;
}
//# sourceMappingURL=TaskExecutor.d.ts.map