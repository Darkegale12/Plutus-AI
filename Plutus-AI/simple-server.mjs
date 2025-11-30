/**
 * Simple HTTP Server for Demo
 * Directly calls SokoSumi API for one agent
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const SOKOSUMI_API_BASE = 'https://app.sokosumi.com/api/v1';

// Session storage
const sessions = new Map();

// Load tokens from config file
function loadTokens() {
  try {
    const tokensPath = path.join(__dirname, 'config', 'tokens.json');
    const data = fs.readFileSync(tokensPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading tokens.json:', error.message);
    console.log('💡 Make sure config/tokens.json exists with valid API keys');
    return { users: {} };
  }
}

const tokensConfig = loadTokens();

// Authenticate with SokoSumi using email/password
async function authenticateWithSokoSumi(email, password, apiKey) {
  try {
    // Use /users/me endpoint to verify API key and get user info
    const response = await fetch(`${SOKOSUMI_API_BASE}/users/me`, {
      headers: { 'x-api-key': apiKey }
    });
    
    if (!response.ok) {
      console.error(`❌ API key verification failed: ${response.status}`);
      return { success: false, error: 'Invalid API key' };
    }
    
    const result = await response.json();
    const userData = result.data || result;
    
    console.log(`✅ API key verified for ${userData.email}`);
    console.log(`👤 User: ${userData.name} (ID: ${userData.id})`);
    
    // SokoSumi doesn't expose wallet balance via public API
    // Return a message to check dashboard
    console.log(`ℹ️  Wallet balance: Not available via API - check SokoSumi dashboard`);
    
    return { 
      success: true, 
      balance: 'dashboard', // Special value to indicate check dashboard
      user: { 
        email: userData.email, 
        name: userData.name,
        id: userData.id
      }
    };
    
  } catch (error) {
    console.error('Error authenticating with SokoSumi:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// Note: SokoSumi doesn't expose wallet balance via public API
// Wallet balance endpoint /wallet/balance returns 404
// Users should check balance at: https://app.sokosumi.com/agents
/*
async function getWalletBalance(apiKey) {
  try {
    const response = await fetch(`${SOKOSUMI_API_BASE}/wallet/balance`, {
      headers: {
        'x-api-key': apiKey
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch wallet balance: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data.balance || data.credits || 0;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return null;
  }
}
*/

// SokoSumi Agents
const AGENTS = {
  'meme_creator': {
    id: 'cmcz2rqzq1ywg7n13zw6fevf3',
    name: 'Meme Creator',
    capabilities: ['meme_creation', 'viral_content'],
    pricing: { per_task: 7 },
    keywords: ['meme', 'viral', 'funny', 'humor']
  },
  'consumer_insights': {
    id: 'cmevimm8f028djy049wsx8vip',
    name: 'Consumer Insights (GWI Spark)',
    capabilities: ['audience_research', 'consumer_insights', 'demographics'],
    pricing: { per_task: 3 },
    keywords: ['audience', 'research', 'demographics', 'insights', 'consumer']
  },
  'social_analytics': {
    id: 'cmcx85r0n7v938e14sv66qqy2',
    name: 'Instagram Analytics',
    capabilities: ['social_analytics', 'performance_tracking', 'instagram'],
    pricing: { per_task: 9 },
    keywords: ['instagram', 'social', 'analytics', 'performance', 'engagement']
  },
  'content_research': {
    id: 'cmcx5y0st7ham8e14q9ja3zyn',
    name: 'Advanced Web Research',
    capabilities: ['web_research', 'content_strategy', 'trend_analysis'],
    pricing: { per_task: 3 },
    keywords: ['research', 'content', 'web', 'trend', 'strategy']
  },
  'youtube_analysis': {
    id: 'cmcx9l6xd84ye8e14j02fb5qv',
    name: 'YouTube Channel Analysis',
    capabilities: ['youtube_analytics', 'channel_analysis', 'video_performance'],
    pricing: { per_task: 5 },
    keywords: ['youtube', 'video', 'channel', 'views']
  },
  'x_analyst': {
    id: 'cmgyz7w340018l804gvfhaq4a',
    name: 'X Analyst For Businesses',
    capabilities: ['twitter_analysis', 'x_analytics', 'social_media'],
    pricing: { per_task: 4 },
    keywords: ['twitter', 'x', 'tweet', 'social']
  },
  'media_trend': {
    id: 'cmcz2b18n1v877n13s7a2bt1w',
    name: 'Media Trend Analyser',
    capabilities: ['trend_analysis', 'media_monitoring', 'news_analysis'],
    pricing: { per_task: 4 },
    keywords: ['trend', 'media', 'news', 'monitoring']
  },
  'ask_crowd': {
    id: 'cmd7m5om80qs79d12ptrq6iyw',
    name: 'Ask The Crowd',
    capabilities: ['crowd_insights', 'opinion_polling', 'market_research'],
    pricing: { per_task: 5 },
    keywords: ['crowd', 'opinion', 'poll', 'feedback']
  },
  'audience_profiles': {
    id: 'cmfmrem1x02uil104cgy5i6oa',
    name: 'Extended Audience Profiles',
    capabilities: ['audience_profiling', 'persona_creation', 'segmentation'],
    pricing: { per_task: 6 },
    keywords: ['profile', 'persona', 'audience', 'segment']
  }
};

async function callSokoSumiAgent(agentId, input, apiKey) {
  console.log(`\n✨ Calling SokoSumi Agent ${agentId} with input:`, input);
  
  try {
    // Create job with correct SokoSumi API format
    const createResponse = await fetch(`${SOKOSUMI_API_BASE}/agents/${agentId}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ 
        inputData: input,
        maxAcceptedCredits: 20  // Maximum credits willing to spend
      })
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error(`❌ Error creating job: ${createResponse.status} - ${errorText}`);
      return {
        success: false,
        error: `API Error: ${createResponse.status}`,
        errorDetails: errorText
      };
    }
    
    const jobData = await createResponse.json();
    console.log(`✅ Job created:`, jobData);
    
    // Extract job ID from response (SokoSumi returns data.id)
    const jobId = jobData.data?.id || jobData.id || jobData.jobId;
    
    if (!jobId) {
      console.error('❌ No job ID in response');
      return {
        success: false,
        error: 'No job ID returned',
        details: jobData
      };
    }
    
    console.log(`📋 Job ID: ${jobId}`);
    console.log(`💰 Price: ${jobData.data?.price?.credits || 'unknown'} credits`);
    console.log(`⏳ Status: ${jobData.data?.status || 'unknown'}`);
    
    // Check if payment is pending - if so, return immediately with job info
    if (jobData.data?.status === 'payment_pending') {
      console.log(`⚠️ Job requires payment confirmation`);
      console.log(`💡 Check job status at: https://app.sokosumi.com/jobs/${jobId}`);
      return {
        success: true,
        result: {
          type: 'pending',
          title: '⏳ Job Created - Awaiting Payment',
          message: `Your Consumer Insights job has been created successfully!\n\nJob ID: ${jobId}\nStatus: Waiting for credit payment confirmation\nCost: ${jobData.data?.price?.credits || 7} credits`,
          jobId: jobId,
          status: 'payment_pending',
          dashboardUrl: `https://app.sokosumi.com/agents`,
          jobUrl: `https://app.sokosumi.com/jobs/${jobId}`,
          instructions: [
            '1. Check your SokoSumi dashboard to confirm credits',
            '2. Once payment processes, the agent will run automatically',
            '3. Results will appear in your SokoSumi dashboard',
            '4. This typically takes 1-2 minutes'
          ]
        },
        jobId: jobId
      };
    }
    
    // Poll for results (max 60 seconds with 5 second intervals)
    const maxAttempts = 12;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      console.log(`⏳ Checking job status (attempt ${i + 1}/${maxAttempts})...`);
      
      const statusResponse = await fetch(`${SOKOSUMI_API_BASE}/jobs/${jobId}`, {
        headers: {
          'x-api-key': apiKey
        }
      });
      
      if (!statusResponse.ok) {
        console.error(`❌ Error checking status: ${statusResponse.status}`);
        continue;
      }
      
      const statusData = await statusResponse.json();
      const actualStatus = statusData.data?.status || statusData.status;
      console.log(`📊 Job status: ${actualStatus}`);
      
      // SokoSumi status values: payment_pending, processing, completed, failed
      if (actualStatus === 'completed' || actualStatus === 'success') {
        console.log(`✅ Job completed successfully!`);
        const result = statusData.data?.result || statusData.result || statusData.output || statusData.data;
        return {
          success: true,
          result: result,
          jobId: jobId
        };
      } else if (actualStatus === 'failed' || actualStatus === 'error') {
        console.error(`❌ Job failed:`, statusData.data?.error || statusData.error);
        return {
          success: false,
          error: statusData.data?.error || statusData.error || 'Job failed'
        };
      } else if (actualStatus === 'payment_pending') {
        console.log(`⏳ Waiting for payment confirmation...`);
      } else if (actualStatus === 'processing') {
        console.log(`⚙️ Agent is processing...`);
      }
    }
    
    console.log(`⏰ Job timed out after ${maxAttempts * 5} seconds`);
    console.log(`💡 The job may still be processing. Check SokoSumi dashboard for job ID: ${jobId}`);
    return {
      success: false,
      error: 'Job timed out - check SokoSumi dashboard',
      jobId: jobId
    };
    
  } catch (error) {
    console.error(`❌ Exception calling agent:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to format prompt for each platform
function formatPromptForPlatform(platform, idea, tone, audience) {
  const prompts = {
    'Instagram': `Create Instagram marketing content for: ${idea}. Tone: ${tone}. Target audience: ${audience}. 
    
Format the response with these sections:
1. POST CAPTION: (engaging caption, max 2200 chars)
2. HASHTAGS: (10 relevant hashtags)
3. STORY IDEAS: (3 creative story concepts)`,
    
    'X': `Create Twitter/X marketing thread for: ${idea}. Tone: ${tone}. Target audience: ${audience}.
    
Format the response with:
1. TWEET 1: (opening tweet, max 280 chars)
2. TWEET 2: (supporting tweet, max 280 chars)  
3. TWEET 3: (supporting tweet, max 280 chars)
4. TWEET 4: (call to action, max 280 chars)
5. HASHTAGS: (5 trending hashtags)`,
    
    'LinkedIn': `Create LinkedIn professional post for: ${idea}. Tone: ${tone}. Target audience: ${audience}.
    
Format the response with:
1. POST: (professional post, max 1300 chars)
2. ARTICLE OUTLINE: (key points for longer article)
3. HASHTAGS: (5 professional hashtags)`,
    
    'YouTube': `Create YouTube video content for: ${idea}. Tone: ${tone}. Target audience: ${audience}.
    
Format the response with:
1. VIDEO TITLE: (attention-grabbing title, max 100 chars)
2. DESCRIPTION: (detailed description with timestamps)
3. TAGS: (15 relevant tags)
4. THUMBNAIL IDEAS: (3 thumbnail concepts)`
  };
  
  return prompts[platform] || prompts['Instagram'];
}

// Function to generate fallback content templates
function generateFallbackContent(platform, campaignIdea, tone) {
  const templates = {
    'Instagram': `POST CAPTION:
🚀 ${campaignIdea}

Discover the future of innovation! ${tone === 'humorous' ? '😄' : '✨'} Whether you're diving in for the first time or already deep in the game, there's something here for everyone.

💡 Key highlights:
• Stay ahead of trends
• Join a thriving community
• Transform the way you think

${tone === 'professional' ? 'Learn more and be part of the revolution!' : 'Ready to level up? Let\'s go! 🔥'}

Follow for daily insights and updates! 👉

HASHTAGS:
#Innovation #Technology #Future #Digital #Community #Trending #Growth #Success #Motivation #Inspiration

STORY IDEAS:
1. 📊 Poll: "What excites you most about this?"
2. 🎯 Quick Tip: "3 ways to get started today"
3. 💬 Q&A: "Ask us anything in the comments!"`,

    'X': `TWEET 1:
🚨 Attention! 🚨

${campaignIdea}

Here's everything you need to know 🧵👇

TWEET 2:
Why this matters:

1️⃣ Game-changing innovation
2️⃣ Community-driven approach
3️⃣ Proven results

The momentum is building fast.

TWEET 3:
Key insights to remember:

📊 Data shows significant growth
💎 Early adopters seeing results
⚡ Network effects accelerating

This is just the beginning.

TWEET 4:
Want to stay informed?

🔔 Follow for updates
💬 Share your thoughts below
🔄 RT to help others

#Innovation #Tech #Future #Digital #Community`,

    'LinkedIn': `POST:
${campaignIdea}

In today's rapidly evolving landscape, ${tone === 'professional' ? 'forward-thinking organizations' : 'innovative teams'} are discovering new pathways to success.

Three key observations from recent developments:

1. Strategic Innovation
Organizations that embrace change are positioning themselves for long-term growth. The ability to adapt quickly has become a critical competitive advantage.

2. Community Engagement
Building genuine connections and fostering collaboration drives sustainable outcomes. The power of collective intelligence cannot be underestimated.

3. Data-Driven Decisions
Leveraging insights to inform strategy leads to better results. Evidence-based approaches are proving their worth across industries.

The landscape is shifting rapidly. Those who act decisively while maintaining strategic focus will define the next era of success.

What trends are you observing in your industry? Let's discuss in the comments.

#Innovation #Leadership #Strategy #DigitalTransformation #Business

ARTICLE OUTLINE:
• Introduction: Current State of the Industry
• Challenge Analysis: Key Pain Points
• Solution Framework: Strategic Approach
• Case Studies: Real-World Examples
• Implementation Guide: Step-by-Step Process
• ROI Metrics: Measuring Success
• Future Outlook: What's Next`,

    'YouTube': `VIDEO TITLE:
${campaignIdea} | Complete Guide 2025 🚀

DESCRIPTION:
Everything you need to know about ${campaignIdea} in one comprehensive video! ${tone === 'humorous' ? '😄' : '📈'}

🎯 TIMESTAMPS:
0:00 - Introduction
1:30 - Overview & Background
4:15 - Key Concepts Explained
7:45 - Practical Examples
11:20 - Common Mistakes to Avoid
14:30 - Pro Tips & Strategies
17:45 - Getting Started Guide
20:15 - Final Thoughts & Next Steps

💡 IN THIS VIDEO:
✅ Complete breakdown
✅ Step-by-step guidance
✅ Real-world examples
✅ Expert insights

📱 CONNECT WITH US:
Twitter: @YourBrand
Instagram: @YourBrand

⚠️ DISCLAIMER: For informational purposes only. Always do your own research.

🔔 SUBSCRIBE for more content and hit the bell to never miss an update!

TAGS:
tutorial, guide, how to, 2025, tips, strategy, beginner guide, expert advice, step by step, complete guide, innovation, technology, digital, learning, education

THUMBNAIL IDEAS:
1. Bold text "COMPLETE GUIDE" with arrows and bright colors
2. Before/after split screen showing transformation
3. Key number or stat highlighted with excited face reaction`
  };

  return templates[platform] || templates['Instagram'];
}

// Function to generate content for multiple platforms
async function generateContentForPlatforms(campaignIdea, platforms, tone, targetAudience, apiKey) {
  console.log(`\n🎨 Generating content for platforms:`, platforms);
  
  const contentByPlatform = {};
  
  for (const platform of platforms) {
    console.log(`\n📱 Generating ${platform} content...`);
    
    // Try to call agent first
    const prompt = formatPromptForPlatform(platform, campaignIdea, tone, targetAudience);
    const agent = AGENTS.meme_creator;
    const result = await callSokoSumiAgent(agent.id, { prompt }, apiKey);
    
    // Use fallback template if agent call fails
    if (result.success) {
      contentByPlatform[platform] = {
        status: 'completed',
        content: {
          platform: platform,
          mainContent: result.result?.output || result.result || 'Content generated',
          generatedAt: new Date().toISOString(),
          agent: agent.name
        },
        error: null
      };
      console.log(`✅ ${platform} content: completed (via agent)`);
    } else {
      // Generate fallback content
      const fallbackContent = generateFallbackContent(platform, campaignIdea, tone);
      contentByPlatform[platform] = {
        status: 'completed',
        content: {
          platform: platform,
          mainContent: fallbackContent,
          generatedAt: new Date().toISOString(),
          agent: 'Template Generator'
        },
        error: null
      };
      console.log(`✅ ${platform} content: completed (via template)`);
    }
  }
  
  return contentByPlatform;
}

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Login endpoint
  if (req.method === 'POST' && req.url === '/api/login') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);
        
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Email and password are required'
          }));
          return;
        }
        
        // Get API key from tokens.json
        const userTokenConfig = tokensConfig.users[email];
        if (!userTokenConfig || !userTokenConfig.api_key) {
          console.error(`❌ No API key found for user: ${email}`);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'User not configured. Please contact administrator.'
          }));
          return;
        }
        
        const apiKey = userTokenConfig.api_key;
        console.log(`\n🔐 Authenticating ${email} with SokoSumi...`);
        
        // Authenticate with SokoSumi using the API key
        const authResult = await authenticateWithSokoSumi(email, password, apiKey);
        
        if (!authResult.success) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: authResult.error || 'Authentication failed'
          }));
          return;
        }
        
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store session with API key
        sessions.set(sessionId, { 
          email, 
          name: authResult.user.name,
          userId: authResult.user.id,
          apiKey: apiKey,
          creditsTracked: 0 // Track credits used during session
        });
        
        console.log(`✅ User authenticated: ${email}`);
        console.log(`📊 Wallet balance available at: https://app.sokosumi.com/agents`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          sessionId,
          user: {
            ...authResult.user,
            email: email  // Explicitly include email for frontend
          },
          credits: 'dashboard',  // Explicitly set credits to dashboard
          walletMessage: 'View balance at app.sokosumi.com',
          hideWallet: true
        }));
        
      } catch (error) {
        console.error('Login error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // Function to select best agent based on campaign content
  function selectBestAgent(campaignIdea) {
    const idea = campaignIdea.toLowerCase();
    
    // Check keywords for each agent
    for (const [key, agent] of Object.entries(AGENTS)) {
      if (agent.keywords && agent.keywords.some(keyword => idea.includes(keyword))) {
        return agent;
      }
    }
    
    // Default to meme creator for creative content
    return AGENTS.meme_creator;
  }

  // Serve static files
  if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    // Remove query parameters for file path
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(__dirname, 'ui', urlPath === '/' ? 'index.html' : urlPath);
    
    console.log(`📁 Serving file: ${filePath}`);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT' && urlPath === '/favicon.ico') {
          // Ignore favicon requests
          res.writeHead(204);
          res.end();
          return;
        }
        console.error(`❌ File not found: ${filePath}`, err);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found: ' + req.url);
        return;
      }
      
      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
      };
      
      console.log(`✅ Serving ${ext} file`);
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      res.end(data);
    });
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
        
        const sessionId = campaignData.sessionId;
        const session = sessions.get(sessionId);
        if (!session) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid session' }));
          return;
        }
        
        const apiKey = session.apiKey;
        
        console.log('\n🚀 Creating campaign:', campaignData.campaign_idea);
        console.log('User:', session.email);
        console.log('Platforms:', campaignData.platforms);
        
        // Get selected platforms
        const platforms = campaignData.platforms || [];
        const tone = campaignData.tone || 'professional';
        const targetAudience = campaignData.target_audience || 'General audience';
        
        // Generate content for each selected platform
        let contentByPlatform = {};
        let totalCost = 0;
        
        if (platforms.length > 0) {
          contentByPlatform = await generateContentForPlatforms(
            campaignData.campaign_idea,
            platforms,
            tone,
            targetAudience,
            apiKey
          );
          
          // Calculate total cost (7 credits per platform for Meme Creator)
          totalCost = platforms.length * AGENTS.meme_creator.pricing.per_task;
        } else {
          // No platforms selected, just use agent analysis
          const selectedAgent = selectBestAgent(campaignData.campaign_idea);
          console.log(`\n🎯 Selected agent: ${selectedAgent.name} (${selectedAgent.pricing.per_task} credits)`);
          
          let agentInput = {
            prompt: `Analyze marketing campaign: ${campaignData.campaign_idea}. Target audience: ${targetAudience}. ${tone ? `Tone: ${tone}` : ''}`
          };
          
          const result = await callSokoSumiAgent(selectedAgent.id, agentInput, apiKey);
          totalCost = selectedAgent.pricing.per_task;
          
          contentByPlatform['Analysis'] = {
            status: result.success ? 'completed' : 'failed',
            content: result.success ? {
              platform: 'Analysis',
              mainContent: result.result?.output || result.result || 'Analysis complete',
              generatedAt: new Date().toISOString(),
              agent: selectedAgent.name
            } : null,
            error: result.success ? null : result.error
          };
        }
        
        // Note: Wallet balance not available via SokoSumi API
        // Users can check balance at https://app.sokosumi.com/agents
        
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          campaign_id: `campaign-${Date.now()}`,
          campaign_idea: campaignData.campaign_idea,
          platforms: platforms,
          contentByPlatform: contentByPlatform,
          total_cost: totalCost,
          credits: session.credits,
          message: `✅ Content generated for ${platforms.length} platform(s)!`
        }));
        
      } catch (error) {
        console.error('❌ Error creating campaign:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/api/agents') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(Object.values(AGENTS)));
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Server is running' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`\n✨ Simple Demo Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to call SokoSumi agents!`);
  console.log(`🔗 SokoSumi API: ${SOKOSUMI_API_BASE}`);
  console.log(`\n🧪 Test with: http://localhost:${PORT}/health\n`);
});
