import { logger } from '../utils/logger.js';
export class TaskDecomposer {
    async decompose(goal) {
        logger.info(`Decomposing goal: ${goal}`);
        const tasks = await this.analyzeAndDecompose(goal);
        logger.info(`Goal decomposed into ${tasks.length} tasks`);
        return tasks;
    }
    async analyzeAndDecompose(goal) {
        return this.decomposeMarketingCampaign(goal);
    }
    decomposeMarketingCampaign(goal) {
        const taskIdPrefix = `task-${Date.now()}`;
        return [
            {
                id: `${taskIdPrefix}-1`,
                title: 'Audience Research & Insights',
                description: `Conduct comprehensive audience research and consumer insights for: ${goal}`,
                requiredCapabilities: ['audience_research', 'consumer_insights', 'market_analysis'],
                estimatedCost: 3.0,
                priority: 0,
                dependencies: [],
                status: 'pending',
            },
            {
                id: `${taskIdPrefix}-2`,
                title: 'Content Strategy & Market Research',
                description: `Research market trends, competitor strategies, and develop content strategy for: ${goal}`,
                requiredCapabilities: ['web_research', 'content_strategy', 'competitive_analysis'],
                estimatedCost: 3.0,
                priority: 1,
                dependencies: [`${taskIdPrefix}-1`],
                status: 'pending',
            },
            {
                id: `${taskIdPrefix}-3`,
                title: 'Viral Content & Meme Creation',
                description: `Create engaging viral content and memes for: ${goal}`,
                requiredCapabilities: ['meme_creation', 'viral_content', 'social_media'],
                estimatedCost: 7.0,
                priority: 2,
                dependencies: [`${taskIdPrefix}-2`],
                status: 'pending',
            },
            {
                id: `${taskIdPrefix}-4`,
                title: 'Social Media Analytics Setup',
                description: `Analyze social media performance and setup analytics for: ${goal}`,
                requiredCapabilities: ['social_analytics', 'instagram_analysis', 'performance_tracking'],
                estimatedCost: 9.0,
                priority: 3,
                dependencies: [`${taskIdPrefix}-3`],
                status: 'pending',
            },
            {
                id: `${taskIdPrefix}-5`,
                title: 'Campaign Optimization',
                description: `Monitor campaign performance and provide optimization recommendations for: ${goal}`,
                requiredCapabilities: ['social_analytics', 'content_analysis', 'performance_tracking'],
                estimatedCost: 9.0,
                priority: 4,
                dependencies: [`${taskIdPrefix}-4`],
                status: 'pending',
            },
        ];
    }
}
//# sourceMappingURL=TaskDecomposer.js.map