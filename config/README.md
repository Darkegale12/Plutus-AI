# SokoSumi API Token Configuration

This file maps user accounts to their SokoSumi API keys for wallet integration.

## How to Configure

1. **Get your SokoSumi API Key:**
   - Go to https://app.sokosumi.com
   - Navigate to Settings → API Keys
   - Copy your API key

2. **Add your API key to `tokens.json`:**
   - Open `config/tokens.json`
   - Replace `YOUR_SOKOSUMI_API_KEY_HERE` with your actual API key
   - Keep the quotes around the key

3. **Add more users (optional):**
   ```json
   {
     "users": {
       "demo@sokosumi.com": {
         "api_key": "sk_your_key_here",
         "description": "Demo user"
       },
       "another@user.com": {
         "api_key": "sk_another_key_here",
         "description": "Another user"
       }
     }
   }
   ```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `tokens.json` to Git with real API keys
- Add `config/tokens.json` to `.gitignore`
- Keep API keys secure and private
- Each user should have their own API key

## What It Does

When a user logs in:
1. Backend validates username/password
2. Backend reads the user's API key from `tokens.json`
3. Backend fetches real wallet balance from SokoSumi using that API key
4. User sees their actual SokoSumi credit balance
5. All agent operations use the user's API key

## Troubleshooting

**Error: "API key not configured"**
- Check that user's email exists in `tokens.json`
- Verify the API key is not empty or "YOUR_SOKOSUMI_API_KEY_HERE"

**Error: "Unable to fetch wallet balance"**
- Verify API key is valid in SokoSumi dashboard
- Check internet connection
- Ensure SokoSumi API is accessible

**Balance shows 0 or wrong amount:**
- Check your actual balance at app.sokosumi.com
- Verify correct API key is configured for the user
- Check server logs for errors
