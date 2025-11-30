import { AgentRegistry } from '../registry/AgentRegistry.js';
import { TaskDecomposer } from './TaskDecomposer.js';
import { TaskExecutor } from './TaskExecutor.js';
import { OutputValidator } from './OutputValidator.js';
import { logger } from '../utils/logger.js';
export class WorkflowOrchestrator {
    workflows = new Map();
    taskDecomposer;
    taskExecutor;
    outputValidator;
    agentRegistry;
    constructor() {
        this.taskDecomposer = new TaskDecomposer();
        this.taskExecutor = new TaskExecutor();
        this.outputValidator = new OutputValidator();
        this.agentRegistry = new AgentRegistry();
    }
    async createWorkflow(config) {
        logger.info(`Creating workflow for goal: ${config.goal}`);
        const workflowId = uuidv4();
        const tasks = await this.taskDecomposer.decompose(config.goal);
        const enrichedTasks = await this.enrichTasks(tasks);
        const agentAssignments = await this.assignAgents(enrichedTasks, config);
        const workflow = {
            id: workflowId,
            goal: config.goal,
            tasks: enrichedTasks,
            status: 'created',
            estimatedCost: enrichedTasks.reduce((sum, t) => sum + t.estimatedCost, 0),
            actualCost: 0,
            agentAssignments,
            startTime: new Date(),
            budget: config.budget,
            deadline: config.deadline,
            qualityThreshold: config.qualityThreshold,
        };
        this.workflows.set(workflowId, workflow);
        this.executeWorkflow(workflowId).catch(error => {
            logger.error(`Workflow ${workflowId} execution failed:`, error);
            workflow.status = 'failed';
        });
        return workflow;
    }
    async executeWorkflow(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow)
            throw new Error(`Workflow ${workflowId} not found`);
        logger.info(`Starting execution of workflow ${workflowId}`);
        workflow.status = 'executing';
        try {
            const taskQueue = this.buildExecutionQueue(workflow.tasks);
            for (const task of taskQueue) {
                await this.executeTask(workflow, task);
            }
            workflow.status = 'completed';
            workflow.endTime = new Date();
            logger.info(`Workflow ${workflowId} completed successfully`);
        }
        catch (error) {
            workflow.status = 'failed';
            workflow.endTime = new Date();
            throw error;
        }
    }
    async executeTask(workflow, task) {
        logger.info(`Executing task ${task.id}: ${task.title}`);
        task.status = 'in_progress';
        try {
            const result = await this.taskExecutor.execute(task, task.assignedAgent, workflow);
            task.output = result;
            task.status = 'completed';
            const validation = await this.outputValidator.validate(task, result, workflow.qualityThreshold);
            task.validationScore = validation.score;
            if (!validation.passed) {
                logger.warn(`Task ${task.id} failed validation. Retrying with different agent...`);
                await this.retryTask(workflow, task);
            }
        }
        catch (error) {
            logger.error(`Task ${task.id} execution failed:`, error);
            task.status = 'failed';
            throw error;
        }
    }
    async retryTask(workflow, task) {
        logger.info(`Retrying task ${task.id}`);
        const agents = await this.agentRegistry.discoverAgents({
            requiredCapabilities: task.requiredCapabilities,
            excludeAgents: [task.assignedAgent],
        });
        if (agents.length === 0) {
            throw new Error(`No alternative agents available for task ${task.id}`);
        }
        task.assignedAgent = agents[0].id;
        task.status = 'pending';
        await this.executeTask(workflow, task);
    }
    buildExecutionQueue(tasks) {
        const queue = [];
        const completed = new Set();
        const addTask = (task) => {
            const canExecute = task.dependencies.every(dep => completed.has(dep));
            if (canExecute && !queue.includes(task)) {
                queue.push(task);
                completed.add(task.id);
                tasks.forEach(t => {
                    if (!completed.has(t.id)) {
                        addTask(t);
                    }
                });
            }
        };
        tasks.forEach(task => {
            if (task.dependencies.length === 0) {
                addTask(task);
            }
        });
        tasks.forEach(addTask);
        return queue;
    }
    async enrichTasks(tasks) {
        return tasks.map((task, index) => ({
            ...task,
            estimatedCost: this.estimateTaskCost(task),
            priority: tasks.length - index,
        }));
    }
    estimateTaskCost(task) {
        const baseCostPerCapability = 0.5;
        const complexityMultiplier = 1 + (task.dependencies.length * 0.2);
        const cost = task.requiredCapabilities.length * baseCostPerCapability * complexityMultiplier;
        return Math.round(cost * 100) / 100;
    }
    async assignAgents(tasks, config) {
        const assignments = new Map();
        for (const task of tasks) {
            const agents = await this.agentRegistry.discoverAgents({
                requiredCapabilities: task.requiredCapabilities,
                maxBudget: config.budget ? config.budget / tasks.length : undefined,
                minReputation: 0.7,
            });
            if (agents.length === 0) {
                throw new Error(`No agents found for task: ${task.title} with capabilities: ${task.requiredCapabilities.join(', ')}`);
            }
            const bestAgent = this.selectBestAgent(agents, task);
            task.assignedAgent = bestAgent.id;
            assignments.set(task.id, bestAgent.id);
            logger.info(`Assigned agent ${bestAgent.name} to task ${task.title}`);
        }
        return assignments;
    }
    selectBestAgent(agents, task) {
        const scoredAgents = agents.map(agent => {
            const reputationScore = agent.reputation || 0.5;
            const costScore = 1 - (agent.pricing.per_task / (task.estimatedCost * 2));
            const totalScore = (reputationScore * 0.7) + (costScore * 0.3);
            return { agent, score: totalScore };
        });
        scoredAgents.sort((a, b) => b.score - a.score);
        return scoredAgents[0].agent;
    }
    async getWorkflowStatus(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow)
            throw new Error(`Workflow ${workflowId} not found`);
        const completedTasks = workflow.tasks.filter(t => t.status === 'completed').length;
        const progress = (completedTasks / workflow.tasks.length) * 100;
        return {
            workflow_id: workflow.id,
            goal: workflow.goal,
            status: workflow.status,
            progress: `${progress.toFixed(1)}%`,
            tasks: {
                total: workflow.tasks.length,
                completed: completedTasks,
                in_progress: workflow.tasks.filter(t => t.status === 'in_progress').length,
                pending: workflow.tasks.filter(t => t.status === 'pending').length,
                failed: workflow.tasks.filter(t => t.status === 'failed').length,
            },
            costs: {
                estimated: workflow.estimatedCost,
                actual: workflow.actualCost,
                remaining_budget: workflow.budget ? workflow.budget - workflow.actualCost : null,
            },
            timing: {
                started: workflow.startTime,
                ended: workflow.endTime,
                deadline: workflow.deadline,
            },
            tasks_detail: workflow.tasks.map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                assigned_agent: t.assignedAgent,
                validation_score: t.validationScore,
            })),
        };
    }
    async getActiveWorkflows() {
        return Array.from(this.workflows.values()).filter(w => w.status !== 'completed' && w.status !== 'failed');
    }
    async validateOutput(params) {
        return this.outputValidator.validate({ id: params.taskId }, params.output, 0.8, params.criteria);
    }
    async negotiateWithAgent(params) {
        const agent = await this.agentRegistry.getAgent(params.agentId);
        if (!agent) {
            throw new Error(`Agent ${params.agentId} not found`);
        }
        const agentPrice = agent.pricing.per_task || 0;
        const proposedBudget = params.proposedBudget || agentPrice;
        const accepted = proposedBudget >= agentPrice * 0.9;
        return {
            agent_id: agent.id,
            agent_name: agent.name,
            asking_price: agentPrice,
            proposed_budget: proposedBudget,
            accepted,
            counter_offer: accepted ? null : agentPrice * 0.95,
            message: accepted
                ? "Agent accepts the proposed terms"
                : `Agent counter-offers at ${agentPrice * 0.95} ADA`,
        };
    }
}
//# sourceMappingURL=WorkflowOrchestrator.js.map