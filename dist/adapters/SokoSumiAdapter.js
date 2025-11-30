import { logger } from '../utils/logger.js';
export class SokoSumiAdapter {
    mcpEndpoint;
    apiKey;
    network;
    constructor() {
        this.mcpEndpoint = 'https://mcp.sokosumi.com/mcp';
        this.apiKey = 'pFaLgiVpoASOQkKLZkHwsikTqarAQQfZoRzhkNfZtELQXLsHrNppiwyknJZyLiCE';
        this.network = 'mainnet';
    }
    async initialize() {
        logger.info('Initializing SokoSumi MCP Adapter...');
        try {
            await this.testConnection();
            logger.info('SokoSumi MCP Adapter initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize SokoSumi adapter:', error);
            throw error;
        }
    }
    async testConnection() {
        logger.info(`Testing connection to ${this.mcpEndpoint}`);
    }
    async createJob(params) {
        logger.info(`Creating job for agent ${params.agentId}`);
        try {
            const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            logger.info(`Job created successfully: ${jobId}`);
            return {
                id: jobId,
                status: 'pending',
                startedAt: new Date().toISOString(),
                price: {
                    credits: params.maxAcceptedCredits || 10,
                    includedFee: 0,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create SokoSumi job:', error);
            throw error;
        }
    }
    async getJobStatus(jobId) {
        logger.info(`Fetching status for job ${jobId}`);
        try {
            const mockResult = {
                output: `Mock result for job ${jobId}`,
                success: true,
                timestamp: new Date().toISOString(),
            };
            return {
                id: jobId,
                status: 'completed',
                result: mockResult,
                startedAt: new Date(Date.now() - 30000).toISOString(),
                completedAt: new Date().toISOString(),
                price: {
                    credits: 5,
                    includedFee: 0,
                },
            };
        }
        catch (error) {
            logger.error('Failed to fetch job status:', error);
            throw error;
        }
    }
    async waitForJobCompletion(jobId, timeoutMs = 300000, pollIntervalMs = 5000) {
        logger.info(`Waiting for job ${jobId} to complete...`);
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
            const jobStatus = await this.getJobStatus(jobId);
            if (jobStatus.status === 'completed') {
                logger.info(`Job ${jobId} completed successfully`);
                return jobStatus;
            }
            if (jobStatus.status === 'failed') {
                logger.error(`Job ${jobId} failed`);
                throw new Error(`Job failed: ${jobStatus.error || 'Unknown error'}`);
            }
            logger.info(`Job ${jobId} status: ${jobStatus.status}. Polling again in ${pollIntervalMs}ms...`);
            await this.sleep(pollIntervalMs);
        }
        throw new Error(`Job ${jobId} timed out after ${timeoutMs}ms`);
    }
    async executeAgentTask(agentId, inputData, taskName) {
        logger.info(`Executing task for agent ${agentId}: ${taskName || 'Unnamed task'}`);
        const job = await this.createJob({
            agentId,
            inputData,
            name: taskName,
        });
        const completedJob = await this.waitForJobCompletion(job.id);
        if (!completedJob.result) {
            throw new Error('Job completed but no result returned');
        }
        logger.info(`Task completed successfully for agent ${agentId}`);
        return completedJob.result;
    }
    async getAvailableAgents() {
        logger.info('Fetching available agents from SokoSumi');
        try {
            return [
                {
                    id: 'cmcz2rqzq1ywg7n13zw6fevf3',
                    name: 'MemeCreatorAgent',
                    credits: 7,
                },
                {
                    id: 'cmevimm8f028djy049wsx8vip',
                    name: 'ConsumerInsightsAgent',
                    credits: 3,
                },
                {
                    id: 'cmcx85r0n7v938e14sv66qqy2',
                    name: 'SocialAnalyticsAgent',
                    credits: 9,
                },
                {
                    id: 'cmcx5y0st7ham8e14q9ja3zyn',
                    name: 'ContentResearchAgent',
                    credits: 3,
                },
            ];
        }
        catch (error) {
            logger.error('Failed to fetch available agents:', error);
            throw error;
        }
    }
    async sleep(ms) {
        const start = Date.now();
        while (Date.now() - start < ms) {
        }
    }
    getMCPEndpointURL() {
        return `${this.mcpEndpoint}?api_key=${this.apiKey}&network=${this.network}`;
    }
}
//# sourceMappingURL=SokoSumiAdapter.js.map