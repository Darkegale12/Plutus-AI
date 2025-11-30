import { Task } from './WorkflowOrchestrator.js';
export interface ValidationResult {
    passed: boolean;
    score: number;
    feedback: string[];
    issues: string[];
    recommendations: string[];
}
export declare class OutputValidator {
    validate(task: Task, output: any, qualityThreshold: number, criteria?: string[]): Promise<ValidationResult>;
    private checkCompleteness;
    private checkFormat;
    private checkQuality;
    private checkCriteria;
    private generateFeedback;
    private identifyIssues;
    private generateRecommendations;
}
//# sourceMappingURL=OutputValidator.d.ts.map