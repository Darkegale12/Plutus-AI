/**
 * Simple HTTP Server Bridge
 * Connects the UI to the backend orchestrator for demo purposes
 */

import http from 'http';
import { WorkflowOrchestrator } from './dist/orchestrator/WorkflowOrchestrator.js';
import { AgentRegistry } from './dist/registry/AgentRegistry.js';
import { logger } from './dist/utils/logger.js';

const PORT = 3000;

// Initialize systems
const orchestrator = new WorkflowOrchestrator();
const agentRegistry = new AgentRegistry();

// Initialize agent registry
await agentRegistry.initialize();

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/campaigns') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const campaignData = JSON.parse(body);
                
                // Build campaign context
                const campaignGoal = campaignData.product_name 
                    ? `${campaignData.campaign_idea} for ${campaignData.product_name}`
                    : campaignData.campaign_idea;
                
                const campaignContext = [
                    campaignGoal,
                    campaignData.target_audience ? `Target: ${campaignData.target_audience}` : '',
                    campaignData.platforms ? `Platforms: ${campaignData.platforms.join(', ')}` : '',
                    campaignData.campaign_tone ? `Tone: ${campaignData.campaign_tone}` : '',
                ].filter(Boolean).join(' | ');

                logger.info('Creating campaign:', campaignContext);

                // Create workflow
                const workflow = await orchestrator.createWorkflow({
                    goal: campaignContext,
                    budget: campaignData.budget_credits || 50,
                    deadline: undefined,
                    qualityThreshold: 0.8,
                });

                // Execute workflow
                const result = await orchestrator.executeWorkflow(workflow.id);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    campaign_id: workflow.id,
                    campaign_idea: campaignData.campaign_idea,
                    tasks: workflow.tasks.map(t => ({
                        id: t.id,
                        title: t.title,
                        description: t.description,
                        status: t.status,
                        result: t.result,
                        assigned_agent: workflow.agentAssignments[t.id] || null,
                        cost: t.estimatedCost
                    })),
                    total_cost: workflow.estimatedCost,
                    execution_result: result
                }));
            } catch (error) {
                logger.error('Error creating campaign:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/api/agents') {
        try {
            const agents = await agentRegistry.getAllAgents();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(agents));
        } catch (error) {
            logger.error('Error fetching agents:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    } else if (req.method === 'GET' && req.url.startsWith('/api/campaigns/')) {
        const workflowId = req.url.split('/').pop();
        try {
            const status = await orchestrator.getWorkflowStatus(workflowId);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(status));
        } catch (error) {
            logger.error('Error fetching campaign status:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    logger.info(`HTTP Server running on http://localhost:${PORT}`);
    logger.info('Ready to handle campaign requests from UI');
});
