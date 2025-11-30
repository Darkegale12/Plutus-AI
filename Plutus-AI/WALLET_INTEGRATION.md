# Real Wallet Integration Guide

## Overview
Plutus AI now integrates with your actual SokoSumi account to display and track real credit balance in real-time.

## Features

### 1. Real Authentication
- Login using your SokoSumi email and API key
- Direct authentication with SokoSumi API
- Session-based credential storage

### 2. Live Credit Balance
- Fetches your actual wallet balance from SokoSumi on login
- Displays real credits in the UI
- Updates balance after each campaign execution
- Shows remaining credits in success notifications

### 3. Real Agent Execution
- Campaigns use your actual SokoSumi API key
- Real credit consumption from your account
- Live status tracking from SokoSumi agents
- Actual results from agent execution

## How to Use

### Step 1: Get Your SokoSumi API Key
1. Go to [https://app.sokosumi.com](https://app.sokosumi.com)
2. Log in to your account
3. Navigate to **Settings** → **API Keys**
4. Copy your API key

### Step 2: Login to Plutus AI
1. Open the Plutus AI application at `http://localhost:3000`
2. Enter your SokoSumi email address
3. Paste your API key
4. Click **Login**

### Step 3: View Your Wallet Balance
- Your real credit balance appears in the top-right corner
- Format: `XX Credits` with a coin icon
- Updates automatically after campaign execution

### Step 4: Create Campaigns
- Fill in the campaign form
- Click **Create Campaign**
- Watch as real SokoSumi agents execute your campaign
- Your wallet balance decreases by the agent cost (7 credits for Meme Creator)
- Balance updates automatically when campaign completes

## Technical Implementation

### Backend Changes (`simple-server.mjs`)

#### 1. Wallet Balance Fetching
```javascript
async function getWalletBalance(apiKey) {
  const response = await fetch(`${SOKOSUMI_API_BASE}/wallet/balance`, {
    headers: { 'x-api-key': apiKey }
  });
  const data = await response.json();
  return data.balance || data.credits;
}
```

#### 2. Login Endpoint
- Accepts email and API key
- Validates by fetching wallet balance
- Returns balance with session data
- Stores API key in session for subsequent requests

#### 3. Campaign Endpoint
- Extracts API key from session
- Passes API key to agent calls
- Fetches updated balance after execution
- Returns new balance to frontend

#### 4. Dynamic API Key Usage
- All agent calls use session-stored API key
- Job polling uses correct API key
- No hardcoded credentials

### Frontend Changes

#### UI (`ui/index.html`)
- Replaced password field with API key input
- Added API key instructions
- Updated wallet balance to use dynamic span element

#### Logic (`ui/app.js`)
- Login sends email and API key (not password)
- Stores balance in `currentWalletBalance` variable
- `updateWalletDisplay()` function updates UI
- Campaign creation sends sessionId to backend
- Balance updates from campaign response

#### Styling (`ui/styles.css`)
- Added `.api-key-info` styling
- Styled API key instructions box
- Consistent with existing design

## API Endpoints

### Login: `POST /api/login`
**Request:**
```json
{
  "email": "your@email.com",
  "apiKey": "your-sokosumi-api-key"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session-12345",
  "user": {
    "email": "your@email.com",
    "name": "your"
  },
  "credits": 50
}
```

### Create Campaign: `POST /api/campaigns`
**Request:**
```json
{
  "sessionId": "session-12345",
  "campaign_idea": "Create viral memes",
  "product_name": "Cardano",
  "campaign_tone": "humorous",
  "platforms": ["X", "Instagram"],
  "budget_credits": 50
}
```

**Response:**
```json
{
  "success": true,
  "campaign_id": "campaign-12345",
  "tasks": [...],
  "total_cost": 7,
  "credits": 43,
  "message": "Campaign executed successfully!"
}
```

## Session Management

### Backend Session Storage
```javascript
sessions.set(sessionId, {
  email: 'user@email.com',
  name: 'user',
  apiKey: 'real-api-key',
  credits: 50
});
```

### Frontend Session Storage
```javascript
localStorage.setItem('sessionId', sessionId);
currentWalletBalance = data.credits;
```

## Credit Tracking

### Initial Balance
- Fetched from SokoSumi on login
- Displayed in wallet widget

### After Campaign
- Updated balance fetched from SokoSumi
- Session updated with new balance
- UI updated automatically
- Success message shows remaining credits

### Real-Time Updates
- Balance reflects actual SokoSumi account
- No mock data or simulated credits
- Live consumption tracking

## Security Notes

1. **API Key Storage**: API keys stored in server-side session map (not localStorage)
2. **Session Validation**: All campaign requests validate session before execution
3. **No Hardcoded Keys**: All API keys come from user login
4. **Secure Transmission**: Use HTTPS in production

## Testing

### Test Login Flow
1. Use real SokoSumi credentials
2. Verify balance displays correctly
3. Compare with SokoSumi dashboard

### Test Campaign Execution
1. Create a campaign
2. Wait for completion
3. Check balance decreased by 7 credits
4. Verify with SokoSumi dashboard

### Test Balance Updates
1. Log in and note balance
2. Execute campaign
3. Check updated balance
4. Logout and login again
5. Balance should reflect latest state from SokoSumi

## Troubleshooting

### "Invalid API key" Error
- Verify API key is correct from SokoSumi settings
- Check for extra spaces when copying
- Ensure API key has proper permissions

### Balance Not Updating
- Check network tab for API responses
- Verify session is valid
- Refresh page and login again

### Server Connection Issues
- Ensure backend is running on port 3000
- Check console for error messages
- Verify SokoSumi API is accessible

## Demo vs Production

### Current Setup (Real Integration)
- ✅ Real SokoSumi authentication
- ✅ Live credit balance
- ✅ Actual agent execution
- ✅ Real credit consumption

### Previous Setup (Demo Mode)
- ❌ Hardcoded demo credentials
- ❌ Mock balance (50 credits)
- ❌ Simulated agent responses
- ❌ No real credit tracking

## Benefits

1. **Transparency**: See actual credits and consumption
2. **Testing**: Test with real agents before production
3. **Accuracy**: No mock data, real results only
4. **Demo-Ready**: Show actual functionality to stakeholders
5. **Budget Tracking**: Monitor real credit usage

## Agent Costs

Current agents available:
- **Meme Creator**: 7 credits per execution
  - ID: `cmcz2rqzq1ywg7n13zw6fevf3`
  - Creates marketing memes based on your campaign

## Next Steps

1. Add more SokoSumi agents to the system
2. Implement credit purchase flow
3. Add usage analytics
4. Create credit alerts (low balance warnings)
5. Add transaction history
6. Implement credit refund for failed jobs

## Support

For issues related to:
- **API Keys**: Contact SokoSumi support
- **Balance Discrepancies**: Check SokoSumi dashboard first
- **Integration Bugs**: Check server logs and browser console

---

**Note**: This is a real integration with your SokoSumi account. All credits consumed are actual charges to your account. Monitor your usage carefully during testing.
