// UI Application for AI Marketing Campaign Creator
// This is a mock/demo version that simulates SokoSumi agent orchestration

// Configuration
const API_BASE_URL = 'http://localhost:3000'; // Backend API endpoint
const MOCK_MODE = false; // Set to true for demo without backend

// Session Management
let sessionId = null;
let currentUser = null;
let currentWalletBalance = 'dashboard'; // Will be 'dashboard' or numeric value
let eventListenersSetup = false; // Flag to prevent duplicate event listeners

// Toast function (defined early for login)
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log(`[${type}] ${message}`);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// State
let state = {
    campaigns: [],
    agents: [],
    stats: {
        activeCampaigns: 0,
        availableAgents: 4,
        contentCreated: 0,
        creditsUsed: 0
    }
};

// Templates - Multiple Agent Types
const templates = {
    crypto: {
        campaign_idea: "Create viral memes about crypto volatility and HODL culture",
        product_name: "Crypto Trading Platform",
        platforms: ["X", "Instagram"],
        tone: "humorous",
        budget: 50
    },
    nft: {
        campaign_idea: "Research NFT collector demographics and purchasing behavior",
        product_name: "NFT Marketplace",
        platforms: ["X", "Instagram"],
        tone: "professional",
        budget: 45
    },
    defi: {
        campaign_idea: "Analyze Instagram engagement for DeFi marketing campaign",
        product_name: "DeFi Protocol",
        platforms: ["Instagram", "X"],
        tone: "professional",
        budget: 60
    },
    genz: {
        campaign_idea: "Analyze trending topics and media coverage for Gen Z crypto campaign",
        product_name: "Youth Crypto App",
        platforms: ["LinkedIn", "Instagram", "X"],
        tone: "casual",
        budget: 40
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Always start with login screen (don't auto-login from localStorage for demo)
    showLoginScreen();
    setupLoginHandler();
});

function fillDemoCredentials() {
    document.getElementById('loginEmail').value = 'demo@sokosumi.com';
    document.getElementById('loginPassword').value = 'demo123';
    showToast('Demo credentials filled! Click Login to continue.', 'success');
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Update user profile display
    if (currentUser) {
        document.getElementById('userDisplayName').textContent = currentUser.name;
        document.getElementById('userMenuName').textContent = currentUser.name;
        document.getElementById('userMenuEmail').textContent = currentUser.email;
    }
    
    // Update wallet balance display
    updateWalletDisplay();
    
    initializeUI();
    loadMockData();
    setupEventListeners();
    startAutoRefresh();
}

function updateWalletDisplay() {
    const walletElement = document.getElementById('walletBalance');
    if (walletElement) {
        // Always show clickable "SokoSumi Credits" link
        walletElement.innerHTML = 'SokoSumi Credits <i class="fas fa-external-link-alt" style="font-size: 0.75em; margin-left: 4px;"></i>';
        // Use user-specific dashboard link with email as identifier
        if (currentUser && currentUser.email) {
            walletElement.href = `https://app.sokosumi.com/agents?user=${encodeURIComponent(currentUser.email)}`;
        } else {
            walletElement.href = 'https://app.sokosumi.com/agents';
        }
        walletElement.target = '_blank';
        walletElement.style.color = 'white';
        walletElement.style.textDecoration = 'none';
        walletElement.style.cursor = 'pointer';
    }
}

function setupLoginHandler() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                sessionId = data.sessionId;
                currentUser = data.user;
                currentWalletBalance = data.credits || 'dashboard';
                localStorage.setItem('sessionId', sessionId);
                
                // Display welcome message with authenticated user name from SokoSumi
                const userName = data.user.name || data.user.email;
                showToast(`Welcome ${userName}!`, 'success');
                
                showMainApp();
            } else {
                showToast(data.error || 'Invalid credentials', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Failed to connect to server. Make sure backend is running.', 'error');
        }
    });
}

function initializeUI() {
    showToast('Dashboard initialized', 'success');
    updateStats();
}

function loadMockData() {
    // Load SokoSumi marketing agents
    state.agents = [
        {
            id: 'cmcz2rqzq1ywg7n13zw6fevf3',
            name: 'Meme Creator',
            capabilities: ['meme_creation', 'viral_content', 'social_media', 'humor'],
            reputation: 0.95,
            tier: 'platinum',
            pricing: { per_task: 7, currency: 'Credits' },
            totalTasksCompleted: 342,
            status: 'active',
            description: 'Creates viral memes and engaging social media content',
            icon: 'fa-smile-beam'
        },
        {
            id: 'cmevimm8f028djy049wsx8vip',
            name: 'Consumer Insights',
            capabilities: ['audience_research', 'consumer_insights', 'market_analysis', 'trends'],
            reputation: 0.91,
            tier: 'platinum',
            pricing: { per_task: 3, currency: 'Credits' },
            totalTasksCompleted: 287,
            status: 'active',
            description: 'Deep audience research and consumer behavior analysis',
            icon: 'fa-users'
        },
        {
            id: 'cmcx85r0n7v938e14sv66qqy2',
            name: 'Social Analytics',
            capabilities: ['social_analytics', 'instagram_analysis', 'performance_tracking', 'metrics'],
            reputation: 0.93,
            tier: 'platinum',
            pricing: { per_task: 9, currency: 'Credits' },
            totalTasksCompleted: 419,
            status: 'active',
            description: 'Comprehensive social media analytics and performance tracking',
            icon: 'fa-chart-line'
        },
        {
            id: 'cmcx5y0st7ham8e14q9ja3zyn',
            name: 'Content Research',
            capabilities: ['web_research', 'content_strategy', 'competitive_analysis', 'seo'],
            reputation: 0.88,
            tier: 'gold',
            pricing: { per_task: 3, currency: 'Credits' },
            totalTasksCompleted: 196,
            status: 'active',
            description: 'Advanced web research and content strategy development',
            icon: 'fa-search'
        }
    ];
}

function setupEventListeners() {
    // Prevent duplicate event listeners
    if (eventListenersSetup) {
        return;
    }
    eventListenersSetup = true;

    // Form submission
    document.getElementById('campaignForm').addEventListener('submit', handleCampaignSubmit);

    // Template buttons
    document.querySelectorAll('.btn-template').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const template = e.currentTarget.dataset.template;
            applyTemplate(template);
        });
    });

    // Refresh buttons
    document.getElementById('refreshCampaigns').addEventListener('click', loadCampaigns);

    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            switchTab(tabName);
        });
    });

    // Modal close on background click
    document.getElementById('campaignModal').addEventListener('click', (e) => {
        if (e.target.id === 'campaignModal') closeCampaignModal();
    });
    document.getElementById('agentModal').addEventListener('click', (e) => {
        if (e.target.id === 'agentModal') closeAgentModal();
    });
}

function handleCampaignSubmit(e) {
    e.preventDefault();
    
    const campaignIdea = document.getElementById('campaignIdeaInput').value;
    const productName = document.getElementById('productNameInput').value;
    const budget = parseInt(document.getElementById('budgetInput').value) || 50;
    const tone = document.getElementById('toneInput').value;
    
    // Get selected platforms
    const platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked'))
        .map(cb => cb.value);

    createCampaign({ 
        campaign_idea: campaignIdea,
        product_name: productName,
        platforms,
        campaign_tone: tone,
        budget_credits: budget
    });
}

function applyTemplate(templateKey) {
    const template = templates[templateKey];
    document.getElementById('campaignIdeaInput').value = template.campaign_idea;
    document.getElementById('productNameInput').value = template.product_name || '';
    document.getElementById('budgetInput').value = template.budget;
    document.getElementById('toneInput').value = template.tone;
    
    // Set platform checkboxes
    document.querySelectorAll('input[name="platform"]').forEach(cb => {
        cb.checked = template.platforms.includes(cb.value);
    });
    
    showToast(`${templateKey.toUpperCase()} template applied!`, 'success');
}

async function createCampaign(params) {
    showToast('Creating marketing campaign...', 'info');

    if (MOCK_MODE) {
        // Mock campaign creation
        const campaign = {
            id: `campaign-${Date.now()}`,
            campaign_idea: params.campaign_idea,
            product_name: params.product_name,
            platforms: params.platforms,
            tone: params.campaign_tone,
            status: 'executing',
            progress: 0,
            tasks: generateCampaignTasks(params),
            budget: params.budget_credits,
            estimatedCost: 31, // Meme(7) + Insights(3) + Analytics(9) + Research(3) + Optimization(9)
            creditsUsed: 0,
            startTime: new Date(),
            outputs: []
        };

        state.campaigns.push(campaign);
        state.stats.activeCampaigns++;
        
        // Simulate campaign execution
        simulateCampaignExecution(campaign);
        
        updateStats();
        renderCampaigns();
        
        // Clear form
        document.getElementById('campaignForm').reset();
        // Re-check default platforms
        document.querySelectorAll('input[name="platform"]').forEach((cb, i) => {
            cb.checked = i < 2; // Check first two by default
        });
        
        showToast('Campaign launched successfully!', 'success');
    } else {
        // Real API call
        try {
            showToast('Connecting to SokoSumi agents...', 'info');
            
            const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...params,
                    sessionId: sessionId
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update wallet balance from response
            if (data.credits !== undefined) {
                currentWalletBalance = data.credits;
                updateWalletDisplay();
            }
            
            // Create campaign object from server response
            const campaign = {
                id: data.campaign_id,
                campaign_idea: params.campaign_idea,
                product_name: params.product_name,
                platforms: params.platforms,
                tone: params.campaign_tone,
                status: 'completed',
                progress: 100,
                tasks: data.tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    agent: task.assigned_agent,
                    status: task.status,
                    progress: 100,
                    credits: task.cost,
                    output: task.result ? generateOutputFromResult(task.result, task.title) : null,
                    error: task.error
                })),
                budget: params.budget_credits,
                estimatedCost: data.total_cost,
                creditsUsed: data.total_cost,
                startTime: new Date(),
                outputs: data.tasks ? data.tasks.filter(t => t.result).map(t => generateOutputFromResult(t.result, t.title)) : []
            };

            state.campaigns.push(campaign);
            state.stats.activeCampaigns++;
            state.stats.contentCreated += (data.tasks ? data.tasks.filter(t => t.status === 'completed').length : data.platforms.length);
            state.stats.creditsUsed += data.total_cost;
            
            updateStats();
            renderCampaigns();
            
            // Clear form
            document.getElementById('campaignForm').reset();
            document.querySelectorAll('input[name="platform"]').forEach((cb, i) => {
                cb.checked = i < 2;
            });
            
            // DISPLAY GENERATED CONTENT
            if (data.contentByPlatform) {
                displayGeneratedContent(data);
                showToast(`Content generated for ${data.platforms.length} platform(s)! ${currentWalletBalance} credits remaining`, 'success');
            } else if (data.success) {
                showToast(`Campaign completed! ${currentWalletBalance} credits remaining`, 'success');
            } else {
                showToast('Campaign completed with some errors', 'warning');
            }
            
        } catch (error) {
            console.error('Error creating campaign:', error);
            showToast(`❌ Error: ${error.message}`, 'error');
        }
    }
}

function generateCampaignTasks(params) {
    return [
        {
            id: 'task-1',
            title: 'Audience Research & Insights',
            description: `Analyzing target audience for ${params.product_name || 'campaign'}`,
            agent: 'Consumer Insights',
            status: 'pending',
            progress: 0,
            credits: 3,
            output: null
        },
        {
            id: 'task-2',
            title: 'Content Strategy & Research',
            description: `Researching trends and competitors for ${params.product_name || 'campaign'}`,
            agent: 'Content Research',
            status: 'pending',
            progress: 0,
            credits: 3,
            output: null
        },
        {
            id: 'task-3',
            title: 'Viral Content & Meme Creation',
            description: `Creating ${params.campaign_tone} memes for ${params.platforms.join(', ')}`,
            agent: 'Meme Creator',
            status: 'pending',
            progress: 0,
            credits: 7,
            output: null
        },
        {
            id: 'task-4',
            title: 'Social Media Analytics Setup',
            description: `Setting up analytics for ${params.platforms.join(', ')} platforms`,
            agent: 'Social Analytics',
            status: 'pending',
            progress: 0,
            credits: 9,
            output: null
        },
        {
            id: 'task-5',
            title: 'Campaign Optimization',
            description: 'Monitoring and optimizing campaign performance',
            agent: 'Social Analytics',
            status: 'pending',
            progress: 0,
            credits: 9,
            output: null
        }
    ];
}

function simulateCampaignExecution(campaign) {
    let currentTask = 0;
    let taskProgress = 0;

    const interval = setInterval(() => {
        // Update task progress
        taskProgress += Math.random() * 20;
        
        if (taskProgress >= 100) {
            const task = campaign.tasks[currentTask];
            task.status = 'completed';
            task.progress = 100;
            
            // Generate mock output for completed task
            task.output = generateMockOutput(task, campaign);
            
            // Add to campaign outputs array
            if (!campaign.outputs) campaign.outputs = [];
            campaign.outputs.push({
                taskTitle: task.title,
                agent: task.agent,
                ...task.output
            });
            
            currentTask++;
            taskProgress = 0;
            
            state.stats.contentCreated++;
            campaign.creditsUsed += task.credits;
            state.stats.creditsUsed += task.credits;
            
            if (currentTask >= campaign.tasks.length) {
                campaign.status = 'completed';
                campaign.endTime = new Date();
                state.stats.activeCampaigns--;
                clearInterval(interval);
                showToast(`Campaign "${campaign.campaign_idea.substring(0, 40)}..." completed!`, 'success');
                // Force re-render to show completed campaigns
                renderCampaigns();
            } else {
                campaign.tasks[currentTask].status = 'in_progress';
                showToast(`${campaign.tasks[currentTask].title} started`, 'info');
            }
        } else {
            campaign.tasks[currentTask].status = 'in_progress';
            campaign.tasks[currentTask].progress = taskProgress;
        }
        
        // Calculate overall progress
        const completedTasks = campaign.tasks.filter(t => t.status === 'completed').length;
        const inProgressTask = campaign.tasks.find(t => t.status === 'in_progress');
        const inProgressContribution = inProgressTask ? (inProgressTask.progress / 100) : 0;
        
        campaign.progress = ((completedTasks + inProgressContribution) / campaign.tasks.length) * 100;
        
        updateStats();
        renderCampaigns();
    }, 2000);
}

function generateMockOutput(task, campaign) {
    const outputs = {
        'Audience Research & Insights': {
            type: 'insights',
            icon: 'fa-users',
            title: 'Target Audience Analysis',
            content: [
                `Primary Audience: Crypto enthusiasts 18-35`,
                `Key Interests: Cryptocurrency, memes, viral content, community engagement`,
                `Peak Activity: 6-9 PM weekdays, all day weekends`,
                `Preferred Platforms: ${campaign.platforms.join(', ')}`,
                `Engagement Strategy: Humor, FOMO, community rewards`
            ]
        },
        'Content Strategy & Research': {
            type: 'strategy',
            icon: 'fa-lightbulb',
            title: 'Content Strategy Report',
            content: [
                `Trending Topics: Meme coins, DeFi yields, NFT drops, Web3 gaming`,
                `Top Competitors: 3 major campaigns analyzed`,
                `Content Mix: 60% memes, 25% educational, 15% promotional`,
                `Posting Schedule: 3-5 posts daily during peak hours`,
                `Visual Style: ${campaign.tone} tone with brand colors`
            ]
        },
        'Viral Content & Meme Creation': {
            type: 'content',
            icon: 'fa-image',
            title: 'Meme Content Package',
            content: [
                `10 Original Memes Created`,
                `Tone: ${campaign.tone}`,
                `Optimized for: ${campaign.platforms.join(', ')}`,
                `Formats: Images (1080x1080), Videos (15-30s)`,
                `Captions: Engaging copy with trending hashtags`
            ],
            preview: 'Sample Meme Preview: "When you check your portfolio..."'
        },
        'Social Media Analytics Setup': {
            type: 'analytics',
            icon: 'fa-chart-line',
            title: 'Analytics Dashboard',
            content: [
                `Metrics Tracked: Reach, Engagement, Conversions, Sentiment`,
                `KPIs Set: 10K reach, 5% engagement rate, 500 conversions`,
                `Tools Configured: Native analytics + custom tracking`,
                `Expected ROI: 3-5x on ${campaign.budget} credit investment`,
                `Alerts: Real-time notifications for viral content`
            ]
        },
        'Campaign Optimization': {
            type: 'optimization',
            icon: 'fa-rocket',
            title: 'Optimization Recommendations',
            content: [
                `Best Performing: Meme #3 (8.5% engagement)`,
                `Optimal Post Times: 7 PM, 9 AM, 2 PM`,
                `Top Platform: ${campaign.platforms[0]} (65% engagement)`,
                `A/B Test Results: ${campaign.tone} tone performs best`,
                `Next Steps: Scale top content, expand to Reddit/Discord`
            ]
        }
    };
    
    return outputs[task.title] || {
        type: 'general',
        icon: 'fa-check-circle',
        title: task.title,
        content: ['Task completed successfully']
    };
}

function generateOutputFromResult(result, taskTitle) {
    // Handle payment pending results
    if (result && result.type === 'pending') {
        return {
            type: 'pending',
            icon: 'fa-clock',
            title: result.title || '⏳ Awaiting Payment',
            content: [
                result.message || '',
                '',
                '📋 Instructions:',
                ...(result.instructions || []),
                '',
                `🔗 View in Dashboard: ${result.dashboardUrl || 'https://app.sokosumi.com/agents'}`
            ],
            jobId: result.jobId,
            dashboardUrl: result.dashboardUrl,
            jobUrl: result.jobUrl
        };
    }
    
    // Convert API result to UI output format
    return {
        type: 'content',
        icon: 'fa-robot',
        title: taskTitle || 'Agent Output',
        content: [
            `Agent Result:`,
            typeof result === 'string' ? result : JSON.stringify(result, null, 2)
        ],
        rawData: result
    };
}

function renderCampaigns() {
    const container = document.getElementById('campaignsList');
    
    const allCampaigns = state.campaigns;
    const activeCampaigns = allCampaigns.filter(c => c.status === 'executing');
    
    if (allCampaigns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullhorn"></i>
                <p>No campaigns yet</p>
                <small>Create your first marketing campaign to get started!</small>
            </div>
        `;
        return;
    }

    container.innerHTML = allCampaigns.map(campaign => `
            <div class="campaign-item" onclick="showCampaignDetails('${campaign.id}')">
                <div class="campaign-header">
                    <div>
                        <div class="campaign-title">${campaign.campaign_idea.substring(0, 50)}${campaign.campaign_idea.length > 50 ? '...' : ''}</div>
                        ${campaign.product_name ? `<div class="campaign-product">${campaign.product_name}</div>` : ''}
                    </div>
                    <span class="campaign-status ${campaign.status}">
                        ${campaign.status === 'completed' ? '✅ ' : campaign.status === 'executing' ? '⚡ ' : ''}${campaign.status}
                    </span>
                </div>
                <div class="campaign-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${campaign.progress}%"></div>
                    </div>
                    <small style="color: var(--text-muted); margin-top: 0.5rem; display: block;">
                        ${campaign.progress.toFixed(0)}% complete • ${campaign.tasks.filter(t => t.status === 'completed').length}/${campaign.tasks.length} tasks
                        ${campaign.status === 'completed' ? ' • Campaign Complete!' : ''}
                    </small>
                </div>
                <div class="campaign-meta">
                    <span>${campaign.platforms[0] === 'X' ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display: inline-block; vertical-align: middle;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' : `<i class="fab fa-${campaign.platforms[0]?.toLowerCase()}"></i>`} ${campaign.platforms.join(', ')}</span>
                    <span><i class="fas fa-coins"></i> ${campaign.creditsUsed} / ${campaign.estimatedCost} credits</span>
                    <span><i class="fas fa-clock"></i> ${getTimeAgo(campaign.startTime)}</span>
                </div>
            </div>
        `).join('');
}

function renderAgents() {
    const container = document.getElementById('agentsGrid');
    
    container.innerHTML = state.agents.map(agent => `
        <div class="agent-card" onclick="showAgentDetails('${agent.id}')">
            <div class="agent-header">
                <div class="agent-avatar">
                    <i class="fas ${agent.icon}"></i>
                </div>
                <div class="agent-info">
                    <h3>${agent.name}</h3>
                    <div class="agent-reputation">
                        <span style="color: var(--warning-color);">${'★'.repeat(Math.floor(agent.reputation * 5))}</span>
                        <span class="reputation-badge ${agent.tier}">${agent.tier}</span>
                    </div>
                </div>
            </div>
            <div class="agent-description">
                <p>${agent.description}</p>
            </div>
            <div class="agent-capabilities">
                ${agent.capabilities.slice(0, 3).map(cap => 
                    `<span class="capability-tag">${cap}</span>`
                ).join('')}
                ${agent.capabilities.length > 3 ? `<span class="capability-tag">+${agent.capabilities.length - 3}</span>` : ''}
            </div>
            <div class="agent-footer">
                <span class="agent-price">${agent.pricing.per_task} ${agent.pricing.currency}</span>
                <span class="agent-tasks">${agent.totalTasksCompleted} tasks</span>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('activeCampaigns').textContent = state.stats.activeCampaigns;
    document.getElementById('availableAgents').textContent = state.stats.availableAgents;
    document.getElementById('contentCreated').textContent = state.stats.contentCreated;
    document.getElementById('creditsUsed').textContent = state.stats.creditsUsed;
}

function showCampaignDetails(campaignId) {
    const campaign = state.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const modal = document.getElementById('campaignModal');
    const details = document.getElementById('campaignDetails');

    details.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem;">${campaign.campaign_idea}</h3>
            ${campaign.product_name ? `<p style="color: var(--primary-color); font-size: 1.1rem; margin-bottom: 1rem;">${campaign.product_name}</p>` : ''}
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px;">
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Status</p>
                    <span class="campaign-status ${campaign.status}">
                        ${campaign.status === 'completed' ? '✅' : campaign.status === 'executing' ? '⚡' : '⏳'} ${campaign.status}
                    </span>
                </div>
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px;">
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Progress</p>
                    <p style="font-size: 1.5rem; font-weight: 600;">${campaign.progress.toFixed(0)}%</p>
                </div>
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px;">
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Credits Used</p>
                    <p style="font-size: 1.25rem; font-weight: 600; color: var(--warning-color);">
                        ${campaign.creditsUsed} / ${campaign.estimatedCost}
                    </p>
                </div>
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px;">
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Platforms</p>
                    <p>${campaign.platforms.map(p => p === 'X' ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> ' + p : `<i class="fab fa-${p.toLowerCase()}"></i> ${p}`).join(' • ')}</p>
                </div>
            </div>

            <h4 style="margin-bottom: 1rem;">📋 Tasks & Results</h4>
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                ${campaign.tasks.map((task, i) => `
                    <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 8px; border-left: 4px solid ${
                        task.status === 'completed' ? 'var(--success-color)' : 
                        task.status === 'in_progress' ? 'var(--primary-color)' : 
                        'var(--border-color)'
                    };">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                            <div>
                                <strong style="font-size: 1.1rem;">${i + 1}. ${task.title}</strong>
                                <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">
                                    ${task.agent} • ${task.credits} credits
                                </p>
                            </div>
                            <span style="font-size: 0.875rem; padding: 0.25rem 0.75rem; border-radius: 4px; background: ${
                                task.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 
                                task.status === 'in_progress' ? 'rgba(99, 102, 241, 0.2)' : 
                                'rgba(148, 163, 184, 0.2)'
                            };">
                                ${task.status === 'completed' ? '✅' : task.status === 'in_progress' ? '⚡' : '⏳'} ${task.status}
                            </span>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">${task.description}</p>
                        ${task.status === 'in_progress' ? `
                            <div class="progress-bar" style="height: 6px; margin-bottom: 0.75rem;">
                                <div class="progress-fill" style="width: ${task.progress || 0}%"></div>
                            </div>
                        ` : ''}
                        ${task.output ? `
                            <div style="margin-top: 1rem; padding: 1.5rem; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--success-color);">
                                <p style="font-weight: 600; margin-bottom: 1rem; font-size: 1.1rem; color: var(--success-color);">
                                    <i class="fas ${task.output.icon}"></i> ${task.output.title}
                                </p>
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    ${task.output.content.map(line => `
                                        <p style="font-size: 0.875rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: 4px; border-left: 3px solid var(--primary-color);">
                                            ${line}
                                        </p>
                                    `).join('')}
                                </div>
                                ${task.output.preview ? `
                                    <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 6px; font-style: italic; text-align: center;">
                                        ${task.output.preview}
                                    </div>
                                ` : ''}
                            </div>
                        ` : task.status === 'pending' ? `
                            <div style="margin-top: 0.75rem; padding: 0.75rem; background: var(--bg-primary); border-radius: 6px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
                                ⏳ Waiting to start...
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>

            ${campaign.status === 'completed' ? `
                <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1)); padding: 2rem; border-radius: 12px; text-align: center; border: 2px solid var(--success-color);">
                    <h3 style="margin-bottom: 1rem; color: var(--success-color);">Campaign Completed!</h3>
                    <p style="font-size: 1.1rem; margin-bottom: 1rem;">All tasks executed successfully by SokoSumi agents</p>
                    <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1.5rem;">
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.875rem;">Total Credits</p>
                            <p style="font-size: 1.5rem; font-weight: 700; color: var(--warning-color);">${campaign.creditsUsed}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.875rem;">Content Pieces</p>
                            <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${campaign.tasks.length}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.875rem;">Duration</p>
                            <p style="font-size: 1.5rem; font-weight: 700;">${Math.round((new Date(campaign.endTime) - new Date(campaign.startTime)) / 1000)}s</p>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    modal.classList.add('active');
}

function showAgentDetails(agentId) {
    const agent = state.agents.find(a => a.id === agentId);
    if (!agent) return;

    const modal = document.getElementById('agentModal');
    const details = document.getElementById('agentDetails');

    details.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div class="agent-avatar" style="width: 100px; height: 100px; font-size: 3rem; margin: 0 auto 1rem;">
                <i class="fas ${agent.icon}"></i>
            </div>
            <h3 style="margin-bottom: 0.5rem;">${agent.name}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">${agent.description}</p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
                <span style="color: var(--warning-color); font-size: 1.5rem;">${'★'.repeat(Math.floor(agent.reputation * 5))}</span>
                <span class="reputation-badge ${agent.tier}" style="font-size: 1rem; padding: 0.5rem 1rem;">${agent.tier}</span>
            </div>
            <p style="color: var(--text-secondary);">Reputation: ${(agent.reputation * 100).toFixed(0)}%</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 8px; text-align: center;">
                <p style="color: var(--text-muted); margin-bottom: 0.5rem;">Tasks Completed</p>
                <p style="font-size: 2rem; font-weight: 700;">${agent.totalTasksCompleted}</p>
            </div>
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 8px; text-align: center;">
                <p style="color: var(--text-muted); margin-bottom: 0.5rem;">Price per Task</p>
                <p style="font-size: 2rem; font-weight: 700; color: var(--warning-color);">${agent.pricing.per_task} ${agent.pricing.currency}</p>
            </div>
        </div>

        <h4 style="margin-bottom: 1rem;">Capabilities</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 2rem;">
            ${agent.capabilities.map(cap => 
                `<span class="capability-tag" style="padding: 0.5rem 1rem; font-size: 0.875rem;">${cap}</span>`
            ).join('')}
        </div>

        <h4 style="margin-bottom: 1rem;">Agent ID</h4>
        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.75rem; word-break: break-all; margin-bottom: 2rem;">
            ${agent.id}
        </div>

        <h4 style="margin-bottom: 1rem;">Status</h4>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="status-dot"></span>
            <span style="text-transform: capitalize;">${agent.status} on SokoSumi Network</span>
        </div>
    `;

    modal.classList.add('active');
}

function closeCampaignModal() {
    document.getElementById('campaignModal').classList.remove('active');
}

function closeAgentModal() {
    document.getElementById('agentModal').classList.remove('active');
}

function loadCampaigns() {
    renderCampaigns();
    showToast('Campaigns refreshed', 'info');
}

function switchTab(tabName) {
    // Special handling for agents tab - open in new page
    if (tabName === 'agents') {
        showAgentsPage();
        return;
    }
    
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load tab-specific content
    if (tabName === 'analytics') {
        renderAnalytics();
    }
}

function showAgentsPage() {
    // Hide main content
    document.getElementById('campaigns-tab').style.display = 'none';
    document.getElementById('analytics-tab').style.display = 'none';
    
    // Hide nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Show agents tab and add back button
    const agentsTab = document.getElementById('agents-tab');
    agentsTab.style.display = 'block';
    agentsTab.classList.add('active');
    
    // Add back button if not already present
    if (!document.getElementById('agentsBackBtn')) {
        const backBtn = document.createElement('button');
        backBtn.id = 'agentsBackBtn';
        backBtn.className = 'btn btn-secondary';
        backBtn.style.cssText = 'margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Campaigns';
        backBtn.onclick = backFromAgentsPage;
        
        agentsTab.insertBefore(backBtn, agentsTab.firstChild);
    }
    
    renderAgentsInTab();
}

function backFromAgentsPage() {
    // Remove back button
    const backBtn = document.getElementById('agentsBackBtn');
    if (backBtn) backBtn.remove();
    
    // Show nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.style.display = '';
    });
    
    // Hide agents tab
    document.getElementById('agents-tab').style.display = 'none';
    document.getElementById('agents-tab').classList.remove('active');
    
    // Show campaigns tab
    document.getElementById('campaigns-tab').style.display = 'block';
    
    // Update active nav tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('[data-tab="campaigns"]').classList.add('active');
}

function renderAgentsInTab() {
    const container = document.getElementById('agentsGrid2');
    if (!container) return;
    
    container.innerHTML = state.agents.map(agent => `
        <div class="agent-card" onclick="showAgentDetails('${agent.id}')">
            <div class="agent-header">
                <div class="agent-avatar">
                    <i class="fas ${agent.icon}"></i>
                </div>
                <div class="agent-info">
                    <h3>${agent.name}</h3>
                    <div class="agent-reputation">
                        <span style="color: var(--warning-color);">${'★'.repeat(Math.floor(agent.reputation * 5))}</span>
                        <span class="reputation-badge ${agent.tier}">${agent.tier}</span>
                    </div>
                </div>
            </div>
            <div class="agent-description">
                <p>${agent.description}</p>
            </div>
            <div class="agent-capabilities">
                ${agent.capabilities.slice(0, 3).map(cap => 
                    `<span class="capability-tag">${cap}</span>`
                ).join('')}
                ${agent.capabilities.length > 3 ? `<span class="capability-tag">+${agent.capabilities.length - 3}</span>` : ''}
            </div>
            <div class="agent-footer">
                <span class="agent-price">${agent.pricing.per_task} ${agent.pricing.currency}</span>
                <span class="agent-tasks">${agent.totalTasksCompleted} tasks</span>
            </div>
        </div>
    `).join('');
}

function renderAnalytics() {
    const container = document.getElementById('analyticsContent');
    if (!container) return;

    const totalCampaigns = state.campaigns.length;
    const completedCampaigns = state.campaigns.filter(c => c.status === 'completed').length;
    const totalCredits = state.campaigns.reduce((sum, c) => sum + c.creditsUsed, 0);
    const avgCreditsPerCampaign = totalCampaigns > 0 ? (totalCredits / totalCampaigns).toFixed(1) : 0;

    // Calculate agent usage
    const agentUsage = {};
    state.campaigns.forEach(campaign => {
        campaign.tasks.forEach(task => {
            if (task.status === 'completed') {
                agentUsage[task.agent] = (agentUsage[task.agent] || 0) + 1;
            }
        });
    });

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: var(--bg-tertiary); padding: 2rem; border-radius: 12px; text-align: center;">
                <i class="fas fa-bullhorn" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${totalCampaigns}</h3>
                <p style="color: var(--text-secondary);">Total Campaigns</p>
            </div>
            <div style="background: var(--bg-tertiary); padding: 2rem; border-radius: 12px; text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 2rem; color: var(--success-color); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${completedCampaigns}</h3>
                <p style="color: var(--text-secondary);">Completed</p>
            </div>
            <div style="background: var(--bg-tertiary); padding: 2rem; border-radius: 12px; text-align: center;">
                <i class="fas fa-coins" style="font-size: 2rem; color: var(--warning-color); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${totalCredits}</h3>
                <p style="color: var(--text-secondary);">Total Credits Spent</p>
            </div>
            <div style="background: var(--bg-tertiary); padding: 2rem; border-radius: 12px; text-align: center;">
                <i class="fas fa-chart-line" style="font-size: 2rem; color: var(--info-color); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${avgCreditsPerCampaign}</h3>
                <p style="color: var(--text-secondary);">Avg Credits/Campaign</p>
            </div>
        </div>

        <div style="background: var(--bg-tertiary); padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1.5rem;"><i class="fas fa-robot"></i> Agent Usage</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${Object.entries(agentUsage).map(([agent, count]) => {
                    const maxCount = Math.max(...Object.values(agentUsage));
                    const percentage = (count / maxCount) * 100;
                    return `
                        <div>
                            <div style="display: flex; justify-content: between; margin-bottom: 0.5rem;">
                                <span>${agent}</span>
                                <span style="margin-left: auto; color: var(--text-muted);">${count} tasks</span>
                            </div>
                            <div style="width: 100%; height: 10px; background: var(--bg-primary); border-radius: 5px; overflow: hidden;">
                                <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)); transition: width 0.5s ease;"></div>
                            </div>
                        </div>
                    `;
                }).join('') || '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No agent usage data yet</p>'}
            </div>
        </div>

        <div style="background: var(--bg-tertiary); padding: 2rem; border-radius: 12px;">
            <h3 style="margin-bottom: 1.5rem;"><i class="fas fa-history"></i> Recent Campaigns</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${state.campaigns.slice(-5).reverse().map(campaign => `
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid ${
                        campaign.status === 'completed' ? 'var(--success-color)' : 'var(--primary-color)'
                    };" onclick="showCampaignDetails('${campaign.id}')" style="cursor: pointer;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p style="font-weight: 600;">${campaign.campaign_idea.substring(0, 60)}...</p>
                                <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem;">
                                    ${campaign.product_name || 'General Campaign'} • ${campaign.creditsUsed} credits
                                </p>
                            </div>
                            <span class="campaign-status ${campaign.status}">${campaign.status}</span>
                        </div>
                    </div>
                `).join('') || '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No campaigns yet</p>'}
            </div>
        </div>
    `;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function startAutoRefresh() {
    setInterval(() => {
        renderCampaigns();
        updateStats();
    }, 3000);
}

// User Profile Functions
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu.style.display === 'none' || !menu.style.display) {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    const profileBtn = document.querySelector('.user-profile-btn');
    
    if (menu && profileBtn && !menu.contains(e.target) && !profileBtn.contains(e.target)) {
        menu.style.display = 'none';
    }
});

function showProfile() {
    toggleUserMenu();
    showToast('Profile page coming soon!', 'info');
}

function showSettings() {
    toggleUserMenu();
    showToast('Settings page coming soon!', 'info');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session
        sessionId = null;
        currentUser = null;
        localStorage.removeItem('sessionId');
        
        // Reset state
        state.campaigns = [];
        state.stats.activeCampaigns = 0;
        state.stats.contentCreated = 0;
        state.stats.creditsUsed = 0;
        
        // Reset event listeners flag so they can be set up again on next login
        eventListenersSetup = false;
        
        toggleUserMenu();
        showToast('Logged out successfully', 'success');
        
        // Show login screen
        setTimeout(() => {
            showLoginScreen();
        }, 500);
    }
}

// Eternl Wallet Connection
async function connectEternlWallet() {
    try {
        // Check if Eternl extension is available
        if (typeof window.cardano === 'undefined' || typeof window.cardano.eternl === 'undefined') {
            showToast('Eternl wallet extension not found. Please install it from eternl.io', 'error');
            // Open eternl.io in new tab
            window.open('https://eternl.io', '_blank');
            return;
        }

        // Request wallet access
        const api = await window.cardano.eternl.enable();
        
        // Get network ID
        const networkId = await api.getNetworkId();
        const networkName = networkId === 1 ? 'Mainnet' : 'Testnet';
        
        // Get wallet address - try used addresses first, then unused
        let addresses = await api.getUsedAddresses();
        if (!addresses || addresses.length === 0) {
            addresses = await api.getUnusedAddresses();
        }
        
        if (addresses && addresses.length > 0) {
            // Convert address to readable format (first 10 chars + ... + last 6 chars)
            const address = addresses[0];
            const shortAddress = `${address.substring(0, 10)}...${address.substring(address.length - 6)}`;
            
            // Update button text
            const walletBtn = document.getElementById('walletConnect');
            if (walletBtn) {
                walletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${shortAddress}`;
            }
            
            showToast(`Wallet connected! Network: ${networkName}`, 'success');
            
            // Optionally get balance
            try {
                const balance = await api.getBalance();
                console.log('Wallet balance:', balance);
            } catch (err) {
                console.log('Could not fetch balance:', err);
            }
        } else {
            showToast('No addresses found in wallet', 'warning');
        }
        
    } catch (error) {
        console.error('Wallet connection error:', error);
        if (error.code === -1) {
            showToast('User declined wallet connection', 'warning');
        } else {
            showToast('Failed to connect wallet: ' + error.message, 'error');
        }
    }
}

// ======================
// CONTENT DISPLAY FUNCTIONS
// ======================

let currentContentData = null;

function displayGeneratedContent(result) {
    if (!result || !result.contentByPlatform) {
        console.error('Invalid content result', result);
        return;
    }
    
    currentContentData = result;
    
    // Navigate to content page
    showContentPage();
    
    const platformTabs = document.getElementById('platformTabs');
    const platformContentArea = document.getElementById('platformContentArea');
    const contentMetaInfo = document.getElementById('contentMetaInfo');
    
    // Clear existing tabs
    platformTabs.innerHTML = '';
    
    // Platform icons
    const platformIcons = {
        'Instagram': '📷',
        'X': '𝕏',
        'LinkedIn': '💼',
        'YouTube': '▶️'
    };
    
    // Create tabs for each platform
    const platforms = Object.keys(result.contentByPlatform);
    platforms.forEach((platform, index) => {
        const tab = document.createElement('button');
        tab.className = 'platform-tab' + (index === 0 ? ' active' : '');
        tab.innerHTML = `
            <span class="platform-tab-icon">${platformIcons[platform] || '📱'}</span>
            <span>${platform}</span>
        `;
        tab.onclick = () => showPlatformContent(platform);
        platformTabs.appendChild(tab);
    });
    
    // Show first platform content
    if (platforms.length > 0) {
        showPlatformContent(platforms[0]);
    }
    
    // Display campaign metadata
    if (contentMetaInfo) {
        contentMetaInfo.innerHTML = `
            <span style="font-size: 0.875rem; color: var(--text-secondary);">
                <i class="fas fa-bullhorn"></i> ${result.campaign_idea ? result.campaign_idea.substring(0, 50) + '...' : 'Campaign'}
                <span style="margin-left: 1rem;"><i class="fas fa-coins"></i> ${result.total_cost || 0} credits used</span>
            </span>
        `;
    }
}

function showPlatformContent(platform) {
    const platformContentArea = document.getElementById('platformContentArea');
    const tabs = document.querySelectorAll('.platform-tab');
    
    // Update active tab
    tabs.forEach(tab => {
        if (tab.textContent.includes(platform)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Get content for platform
    const platformData = currentContentData.contentByPlatform[platform];
    
    if (!platformData) {
        platformContentArea.innerHTML = '<div class="content-error">No content available for this platform</div>';
        return;
    }
    
    if (platformData.status === 'error' || platformData.status === 'failed') {
        platformContentArea.innerHTML = `<div class="content-error">${platformData.error || 'Failed to generate content'}</div>`;
        return;
    }
    
    // Render platform-specific content
    renderPlatformContent(platform, platformData.content);
}

function renderPlatformContent(platform, content) {
    const platformContentArea = document.getElementById('platformContentArea');
    
    if (!content || !content.mainContent) {
        platformContentArea.innerHTML = '<div class="content-error">No content available</div>';
        return;
    }
    
    // Route to platform-specific renderer
    switch (platform) {
        case 'Instagram':
            renderInstagramContent(content);
            break;
        case 'X':
            renderXContent(content);
            break;
        case 'LinkedIn':
            renderLinkedInContent(content);
            break;
        case 'YouTube':
            renderYouTubeContent(content);
            break;
        default:
            renderGenericContent(content);
    }
}

function renderInstagramContent(content) {
    const platformContentArea = document.getElementById('platformContentArea');
    const parsed = parseInstagramContent(content.mainContent);
    
    let html = '';
    
    // Caption
    if (parsed.caption) {
        html += createContentSection('📝 Caption', parsed.caption);
    }
    
    // Hashtags
    if (parsed.hashtags) {
        html += createContentSection('#️⃣ Hashtags', parsed.hashtags);
    }
    
    // Story Ideas
    if (parsed.story) {
        html += createContentSection('📖 Story Ideas', parsed.story);
    }
    
    // Metadata
    html += createMetadata(content);
    
    platformContentArea.innerHTML = html;
}

function renderXContent(content) {
    const platformContentArea = document.getElementById('platformContentArea');
    const parsed = parseXContent(content.mainContent);
    
    let html = '';
    
    // Tweet Thread
    if (parsed.tweets && parsed.tweets.length > 0) {
        parsed.tweets.forEach((tweet, index) => {
            html += createContentSection(`🐦 Tweet ${index + 1}/${parsed.tweets.length}`, tweet);
        });
    } else {
        html += createContentSection('🐦 Tweet', content.mainContent);
    }
    
    // Metadata
    html += createMetadata(content);
    
    platformContentArea.innerHTML = html;
}

function renderLinkedInContent(content) {
    const platformContentArea = document.getElementById('platformContentArea');
    const parsed = parseLinkedInContent(content.mainContent);
    
    let html = '';
    
    // Post
    if (parsed.post) {
        html += createContentSection('📄 LinkedIn Post', parsed.post);
    }
    
    // Article Outline
    if (parsed.article) {
        html += createContentSection('📰 Article Outline (Optional)', parsed.article);
    }
    
    // Metadata
    html += createMetadata(content);
    
    platformContentArea.innerHTML = html;
}

function renderYouTubeContent(content) {
    const platformContentArea = document.getElementById('platformContentArea');
    const parsed = parseYouTubeContent(content.mainContent);
    
    let html = '';
    
    // Title
    if (parsed.title) {
        html += createContentSection('📌 Video Title', parsed.title);
    }
    
    // Description
    if (parsed.description) {
        html += createContentSection('📝 Description', parsed.description);
    }
    
    // Tags
    if (parsed.tags) {
        html += createContentSection('🏷️ Tags', parsed.tags);
    }
    
    // Thumbnail Ideas
    if (parsed.thumbnail) {
        html += createContentSection('🖼️ Thumbnail Ideas', parsed.thumbnail);
    }
    
    // Metadata
    html += createMetadata(content);
    
    platformContentArea.innerHTML = html;
}

function renderGenericContent(content) {
    const platformContentArea = document.getElementById('platformContentArea');
    
    let html = createContentSection('📄 Generated Content', content.mainContent);
    html += createMetadata(content);
    
    platformContentArea.innerHTML = html;
}

// Helper: Create content section
function createContentSection(title, content) {
    const sectionId = 'section_' + Math.random().toString(36).substr(2, 9);
    return `
        <div class="content-section">
            <div class="content-section-header">
                <h4 class="content-section-title">${title}</h4>
                <button class="copy-btn" onclick="copyToClipboard('${sectionId}', this)">
                    📋 Copy
                </button>
            </div>
            <div class="content-box" id="${sectionId}">${escapeHtml(content)}</div>
        </div>
    `;
}

// Helper: Create metadata
function createMetadata(content) {
    const date = new Date(content.generatedAt).toLocaleString();
    return `
        <div class="content-metadata">
            <span>🤖 ${content.agent || 'AI Agent'}</span>
            <span>📅 ${date}</span>
            <span>🎯 ${content.platform || 'Multi-Platform'}</span>
        </div>
    `;
}

// Helper: Copy to clipboard
async function copyToClipboard(elementId, button) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.textContent;
    
    try {
        await navigator.clipboard.writeText(text);
        button.classList.add('copied');
        button.innerHTML = '✅ Copied!';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '📋 Copy';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy to clipboard', 'error');
    }
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close content panel (navigate back to main)
function closeContentPanel() {
    backToMain();
}

// Navigate back to main campaigns view
function backToMain() {
    // Hide content page
    document.getElementById('content-page').style.display = 'none';
    
    // Show campaigns tab
    document.getElementById('campaigns-tab').style.display = 'block';
    
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.style.display = '';
        if (tab.dataset.tab === 'campaigns') {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    currentContentData = null;
}

// Show content page (hide main tabs)
function showContentPage() {
    // Hide all main tabs
    document.getElementById('campaigns-tab').style.display = 'none';
    document.getElementById('agents-tab').style.display = 'none';
    document.getElementById('analytics-tab').style.display = 'none';
    
    // Hide navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Show content page
    document.getElementById('content-page').style.display = 'block';
}

// ======================
// CONTENT PARSERS
// ======================

function parseInstagramContent(content) {
    const result = { caption: '', hashtags: '', story: '' };
    
    const captionMatch = content.match(/Caption[:\s]*([\s\S]*?)(?=Hashtags|Story|$)/i);
    const hashtagsMatch = content.match(/Hashtags[:\s]*([\s\S]*?)(?=Story|Caption|$)/i);
    const storyMatch = content.match(/Story Ideas?[:\s]*([\s\S]*?)(?=Caption|Hashtags|$)/i);
    
    result.caption = captionMatch ? captionMatch[1].trim() : content;
    result.hashtags = hashtagsMatch ? hashtagsMatch[1].trim() : '';
    result.story = storyMatch ? storyMatch[1].trim() : '';
    
    return result;
}

function parseXContent(content) {
    const result = { tweets: [] };
    
    // Try to split by Tweet 1, Tweet 2, etc.
    const tweetMatches = content.match(/Tweet \d+[:\s]*([\s\S]*?)(?=Tweet \d+|$)/gi);
    
    if (tweetMatches && tweetMatches.length > 0) {
        result.tweets = tweetMatches.map(match => {
            return match.replace(/^Tweet \d+[:\s]*/i, '').trim();
        });
    } else {
        // Fallback: split by newlines or keep as single tweet
        result.tweets = [content];
    }
    
    return result;
}

function parseLinkedInContent(content) {
    const result = { post: '', article: '' };
    
    const postMatch = content.match(/Post[:\s]*([\s\S]*?)(?=Article|$)/i);
    const articleMatch = content.match(/Article(?: Outline)?[:\s]*([\s\S]*?)(?=Post|$)/i);
    
    result.post = postMatch ? postMatch[1].trim() : content;
    result.article = articleMatch ? articleMatch[1].trim() : '';
    
    return result;
}

function parseYouTubeContent(content) {
    const result = { title: '', description: '', tags: '', thumbnail: '' };
    
    const titleMatch = content.match(/Title[:\s]*([\s\S]*?)(?=Description|Tags|Thumbnail|$)/i);
    const descMatch = content.match(/Description[:\s]*([\s\S]*?)(?=Title|Tags|Thumbnail|$)/i);
    const tagsMatch = content.match(/Tags[:\s]*([\s\S]*?)(?=Title|Description|Thumbnail|$)/i);
    const thumbMatch = content.match(/Thumbnail(?: Ideas?)?[:\s]*([\s\S]*?)(?=Title|Description|Tags|$)/i);
    
    result.title = titleMatch ? titleMatch[1].trim() : '';
    result.description = descMatch ? descMatch[1].trim() : content;
    result.tags = tagsMatch ? tagsMatch[1].trim() : '';
    result.thumbnail = thumbMatch ? thumbMatch[1].trim() : '';
    
    return result;
}

// Show Examples Modal
function showExamples() {
    const modal = document.getElementById('examplesModal');
    const content = document.getElementById('examplesContent');
    
    content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Instagram Example -->
            <div class="example-card">
                <div class="example-header">
                    <h3><i class="fab fa-instagram" style="color: #E4405F;"></i> Instagram Content Example</h3>
                    <span class="example-badge">Visual Platform</span>
                </div>
                <div class="example-body">
                    <div class="example-section">
                        <h4>📝 POST CAPTION</h4>
                        <div class="example-content">
                            🚀 Ready to ride the crypto wave? 📈
                            
                            The future of finance is HERE and it's decentralized! 💰✨
                            
                            Whether you're a seasoned trader or just crypto-curious, now's the perfect time to dive in. From Bitcoin to emerging altcoins, the opportunities are endless! 🌊
                            
                            💡 Pro tip: Always DYOR (Do Your Own Research) and never invest more than you can afford to lose.
                            
                            Double tap if you're bullish on crypto! 🚀🌕
                            
                            👉 Follow for daily crypto insights and market updates!
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <h4>#️⃣ HASHTAGS</h4>
                        <div class="example-content">
                            #Crypto #Bitcoin #Ethereum #Blockchain #CryptoTrading #DeFi #Web3 #CryptoCommunity #HODL #ToTheMoon
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <h4>📖 STORY IDEAS</h4>
                        <div class="example-content">
                            1. 📊 Poll: "What's your favorite crypto for 2025?"
                            2. 🎯 Quick Tip: "3 signs of a bull market"
                            3. 💬 Q&A Session: "Ask me anything about crypto!"
                        </div>
                    </div>
                </div>
            </div>

            <!-- X/Twitter Example -->
            <div class="example-card">
                <div class="example-header">
                    <h3><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X (Twitter) Thread Example</h3>
                    <span class="example-badge">Microblogging</span>
                </div>
                <div class="example-body">
                    <div class="example-section">
                        <h4>🐦 TWEET 1 (Opening)</h4>
                        <div class="example-content">
                            🚨 Crypto Market Alert! 🚨
                            
                            Bitcoin just hit a major milestone. Here's what you need to know about where we're heading next 🧵👇
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <h4>🐦 TWEET 2</h4>
                        <div class="example-content">
                            The recent surge isn't just random. Three key factors are driving this momentum:
                            
                            1️⃣ Institutional adoption
                            2️⃣ Regulatory clarity
                            3️⃣ Technical breakout patterns
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <h4>🐦 TWEET 3</h4>
                        <div class="example-content">
                            Smart investors are watching on-chain metrics closely:
                            
                            📊 Exchange outflows increasing
                            💎 Long-term holders accumulating
                            ⚡ Network activity at all-time highs
                            
                            These are classic signs of strength.
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <h4>🐦 TWEET 4 (Call to Action)</h4>
                        <div class="example-content">
                            Want to stay ahead of the curve? 
                            
                            🔔 Follow for daily crypto analysis
                            💬 Drop your predictions below
                            🔄 RT to help others stay informed
                            
                            #Bitcoin #Crypto #Blockchain
                        </div>
                    </div>
                </div>
            </div>

            <!-- LinkedIn Example -->
            <div class="example-card">
                <div class="example-header">
                    <h3><i class="fab fa-linkedin" style="color: #0A66C2;"></i> LinkedIn Professional Post Example</h3>
                    <span class="example-badge">Professional Network</span>
                </div>
                <div class="example-body">
                    <div class="example-section">
                        <h4>📄 POST</h4>
                        <div class="example-content">
                            The Blockchain Revolution in Enterprise Finance 🚀
                            
                            After spending the last quarter consulting with Fortune 500 companies on blockchain integration, I've observed three transformative trends reshaping corporate finance:
                            
                            1. Smart Contract Automation
                            Companies are reducing settlement times from days to minutes, cutting operational costs by up to 40%. The efficiency gains are remarkable.
                            
                            2. Transparent Supply Chain Finance
                            Real-time visibility into transactions is eliminating disputes and improving working capital management. Trust is being rebuilt through technology.
                            
                            3. Decentralized Treasury Management
                            Forward-thinking CFOs are diversifying treasury holdings with digital assets, hedging against traditional market volatility.
                            
                            The question is no longer "if" blockchain will transform finance, but "how quickly" can organizations adapt.
                            
                            What challenges is your organization facing in the digital transformation journey? Let's discuss in the comments.
                            
                            #Blockchain #Finance #Innovation #DigitalTransformation #Web3
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <h4>📰 ARTICLE OUTLINE (Optional)</h4>
                        <div class="example-content">
                            • Introduction: The State of Blockchain in 2025
                            • Case Study 1: Global Bank Transformation
                            • Case Study 2: Supply Chain Success Story
                            • Technical Deep Dive: Smart Contract Architecture
                            • ROI Analysis: Cost-Benefit Breakdown
                            • Implementation Roadmap
                            • Conclusion: Future Outlook
                        </div>
                    </div>
                </div>
            </div>

            <!-- YouTube Example -->
            <div class="example-card">
                <div class="example-header">
                    <h3><i class="fab fa-youtube" style="color: #FF0000;"></i> YouTube Video Content Example</h3>
                    <span class="example-badge">Video Platform</span>
                </div>
                <div class="example-body">
                    <div class="example-section">
                        <h4>📌 VIDEO TITLE</h4>
                        <div class="example-content">
                            Crypto Market Analysis 2025: Top 5 Coins to Watch! 🚀💰 (Expert Predictions)
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <h4>📝 DESCRIPTION</h4>
                        <div class="example-content">
                            In this comprehensive crypto market analysis, we break down the top 5 cryptocurrencies positioned for massive growth in 2025! 📈
                            
                            🎯 TIMESTAMPS:
                            0:00 - Introduction
                            1:15 - Market Overview
                            3:45 - #5 Solana (SOL)
                            6:20 - #4 Cardano (ADA)
                            9:10 - #3 Polygon (MATIC)
                            12:05 - #2 Ethereum (ETH)
                            15:30 - #1 Bitcoin (BTC)
                            18:45 - Portfolio Strategy
                            21:00 - Final Thoughts
                            
                            💡 KEY POINTS COVERED:
                            ✅ Technical analysis
                            ✅ Fundamental metrics
                            ✅ Risk assessment
                            ✅ Entry/exit strategies
                            
                            ⚠️ DISCLAIMER: This is not financial advice. Always do your own research.
                            
                            📱 FOLLOW ME:
                            Twitter: @CryptoExpert
                            Instagram: @CryptoInsights
                            
                            🔔 Don't forget to SUBSCRIBE and hit the bell for daily crypto updates!
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <h4>🏷️ TAGS</h4>
                        <div class="example-content">
                            cryptocurrency, bitcoin, ethereum, crypto trading, blockchain, crypto news, altcoins, crypto investing, market analysis, crypto 2025, bitcoin prediction, crypto portfolio, DeFi, Web3, crypto tutorial
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <h4>🖼️ THUMBNAIL IDEAS</h4>
                        <div class="example-content">
                            1. Split screen: Bitcoin logo vs chart going up with "TOP 5" in bold
                            2. Your face with shocked expression + green arrows + "2025 PREDICTIONS"
                            3. Coin logos arranged in countdown format (5-4-3-2-1) with fire emojis
                        </div>
                    </div>
                </div>
            </div>

            <div style="text-align: center; padding: 2rem; background: rgba(99, 102, 241, 0.1); border-radius: 12px;">
                <h3 style="margin-bottom: 1rem;">🎯 Ready to Create Your Own?</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Use our AI-powered platform to generate platform-specific content for your brand!
                </p>
                <button class="btn btn-primary" onclick="closeExamplesModal()">
                    <i class="fas fa-rocket"></i> Start Creating
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeExamplesModal() {
    document.getElementById('examplesModal').classList.remove('active');
}

// Make functions globally accessible
window.showCampaignDetails = showCampaignDetails;
window.showAgentDetails = showAgentDetails;
window.closeCampaignModal = closeCampaignModal;
window.closeAgentModal = closeAgentModal;
window.toggleUserMenu = toggleUserMenu;
window.showProfile = showProfile;
window.showSettings = showSettings;
window.logout = logout;
window.fillDemoCredentials = fillDemoCredentials;
window.connectEternlWallet = connectEternlWallet;
window.backFromAgentsPage = backFromAgentsPage;
window.copyToClipboard = copyToClipboard;
window.closeContentPanel = closeContentPanel;
window.backToMain = backToMain;
window.showExamples = showExamples;
window.closeExamplesModal = closeExamplesModal;
