/**
 * Workflow Orchestrator
 * 
 * Core brain of the multi-agent system that:
 * - Decomposes high-level goals into subtasks
 * - Assigns tasks to optimal agents
 * - Monitors execution progress
 * - Validates outputs
 * - Coordinates workflow completion
 */

import { AgentRegistry } from '../registry/AgentRegistry.js';
import { TaskDecomposer } from './TaskDecomposer.js';
import { TaskExecutor } from './TaskExecutor.js';
import { OutputValidator } from './OutputValidator.js';
import { logger } from '../utils/logger.js';

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

export class WorkflowOrchestrator {
  private workflows: Map<string, Workflow> = new Map();
  private taskDecomposer: TaskDecomposer;
  private taskExecutor: TaskExecutor;
  private outputValidator: OutputValidator;
  private agentRegistry: AgentRegistry;

  constructor() {
    this.taskDecomposer = new TaskDecomposer();
    this.taskExecutor = new TaskExecutor();
    this.outputValidator = new OutputValidator();
    this.agentRegistry = new AgentRegistry();
  }

  /**
   * Create a new workflow from a high-level business goal
   */
  async createWorkflow(config: WorkflowConfig): Promise<Workflow> {
    logger.info(`Creating workflow for goal: ${config.goal}`);

    const workflowId = uuidv4();
    
    // Step 1: Decompose the goal into subtasks using AI
    const tasks = await this.taskDecomposer.decompose(config.goal);
    
    // Step 2: Estimate costs and assign priorities
    const enrichedTasks = await this.enrichTasks(tasks);
    
    // Step 3: Find and assign optimal agents for each task
    const agentAssignments = await this.assignAgents(enrichedTasks, config);
    
    const workflow: Workflow = {
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

    // Step 4: Start workflow execution asynchronously
    this.executeWorkflow(workflowId).catch(error => {
      logger.error(`Workflow ${workflowId} execution failed:`, error);
      workflow.status = 'failed';
    });

    return workflow;
  }

  /**
   * Execute a workflow by coordinating task execution
   */
  private async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    logger.info(`Starting execution of workflow ${workflowId}`);
    workflow.status = 'executing';

    try {
      // Execute tasks respecting dependencies
      const taskQueue = this.buildExecutionQueue(workflow.tasks);

      for (const task of taskQueue) {
        await this.executeTask(workflow, task);
      }

      workflow.status = 'completed';
      workflow.endTime = new Date();
      logger.info(`Workflow ${workflowId} completed successfully`);
    } catch (error) {
      workflow.status = 'failed';
      workflow.endTime = new Date();
      throw error;
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(workflow: Workflow, task: Task): Promise<void> {
    logger.info(`Executing task ${task.id}: ${task.title}`);
    task.status = 'in_progress';

    try {
      // Execute task with assigned agent
      const result = await this.taskExecutor.execute(
        task,
        task.assignedAgent!,
        workflow
      );

      task.output = result;
      task.status = 'completed';

      // Validate output quality
      const validation = await this.outputValidator.validate(
        task,
        result,
        workflow.qualityThreshold
      );

      task.validationScore = validation.score;

      if (!validation.passed) {
        logger.warn(`Task ${task.id} failed validation. Retrying with different agent...`);
        await this.retryTask(workflow, task);
      }
    } catch (error) {
      logger.error(`Task ${task.id} execution failed:`, error);
      task.status = 'failed';
      throw error;
    }
  }

  /**
   * Retry a failed task with a different agent
   */
  private async retryTask(workflow: Workflow, task: Task): Promise<void> {
    logger.info(`Retrying task ${task.id}`);
    
    // Find alternative agent
    const agents = await this.agentRegistry.discoverAgents({
      requiredCapabilities: task.requiredCapabilities,
      excludeAgents: [task.assignedAgent!],
    });

    if (agents.length === 0) {
      throw new Error(`No alternative agents available for task ${task.id}`);
    }

    // Assign new agent and retry
    task.assignedAgent = agents[0].id;
    task.status = 'pending';
    await this.executeTask(workflow, task);
  }

  /**
   * Build execution queue respecting task dependencies
   */
  private buildExecutionQueue(tasks: Task[]): Task[] {
    const queue: Task[] = [];
    const completed = new Set<string>();

    const addTask = (task: Task) => {
      // Check if all dependencies are completed
      const canExecute = task.dependencies.every(dep => completed.has(dep));
      
      if (canExecute && !queue.includes(task)) {
        queue.push(task);
        completed.add(task.id);
        
        // Check if any waiting tasks can now be added
        tasks.forEach(t => {
          if (!completed.has(t.id)) {
            addTask(t);
          }
        });
      }
    };

    // Start with tasks that have no dependencies
    tasks.forEach(task => {
      if (task.dependencies.length === 0) {
        addTask(task);
      }
    });

    // Add remaining tasks
    tasks.forEach(addTask);

    return queue;
  }

  /**
   * Enrich tasks with cost estimates and priorities
   */
  private async enrichTasks(tasks: Task[]): Promise<Task[]> {
    return tasks.map((task, index) => ({
      ...task,
      estimatedCost: this.estimateTaskCost(task),
      priority: tasks.length - index, // Earlier tasks have higher priority
    }));
  }

  /**
   * Estimate cost for a task based on complexity and required capabilities
   */
  private estimateTaskCost(task: Task): number {
    // Base cost per capability
    const baseCostPerCapability = 0.5; // ADA
    
    // Complexity multiplier based on description length and dependencies
    const complexityMultiplier = 1 + (task.dependencies.length * 0.2);
    
    const cost = task.requiredCapabilities.length * baseCostPerCapability * complexityMultiplier;
    
    return Math.round(cost * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Assign optimal agents to tasks
   */
  private async assignAgents(
    tasks: Task[],
    config: WorkflowConfig
  ): Promise<Map<string, string>> {
    const assignments = new Map<string, string>();

    for (const task of tasks) {
      // Find agents with required capabilities
      const agents = await this.agentRegistry.discoverAgents({
        requiredCapabilities: task.requiredCapabilities,
        maxBudget: config.budget ? config.budget / tasks.length : undefined,
        minReputation: 0.7, // Require at least 70% reputation
      });

      if (agents.length === 0) {
        throw new Error(
          `No agents found for task: ${task.title} with capabilities: ${task.requiredCapabilities.join(', ')}`
        );
      }

      // Select best agent based on reputation and cost
      const bestAgent = this.selectBestAgent(agents, task);
      task.assignedAgent = bestAgent.id;
      assignments.set(task.id, bestAgent.id);

      logger.info(`Assigned agent ${bestAgent.name} to task ${task.title}`);
    }

    return assignments;
  }

  /**
   * Select the best agent for a task
   */
  private selectBestAgent(agents: any[], task: Task): any {
    // Score agents based on reputation and cost
    const scoredAgents = agents.map(agent => {
      const reputationScore = agent.reputation || 0.5;
      const costScore = 1 - (agent.pricing.per_task / (task.estimatedCost * 2));
      
      // Weight: 70% reputation, 30% cost
      const totalScore = (reputationScore * 0.7) + (costScore * 0.3);
      
      return { agent, score: totalScore };
    });

    // Sort by score descending
    scoredAgents.sort((a, b) => b.score - a.score);

    return scoredAgents[0].agent;
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<any> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

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

  /**
   * Get all active workflows
   */
  async getActiveWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(
      w => w.status !== 'completed' && w.status !== 'failed'
    );
  }

  /**
   * Validate agent output
   */
  async validateOutput(params: {
    taskId: string;
    agentId: string;
    output: any;
    criteria?: string[];
  }): Promise<any> {
    return this.outputValidator.validate(
      { id: params.taskId } as Task,
      params.output,
      0.8,
      params.criteria
    );
  }

  /**
   * Negotiate with an agent
   */
  async negotiateWithAgent(params: {
    agentId: string;
    taskRequirements: any;
    proposedBudget?: number;
  }): Promise<any> {
    const agent = await this.agentRegistry.getAgent(params.agentId);
    
    if (!agent) {
      throw new Error(`Agent ${params.agentId} not found`);
    }

    // Simple negotiation logic - can be enhanced with AI
    const agentPrice = agent.pricing.per_task || 0;
    const proposedBudget = params.proposedBudget || agentPrice;

    const accepted = proposedBudget >= agentPrice * 0.9; // Accept if within 10% of asking price

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
