# Environment Variables Setup

## Optional: OpenAI API Key

The OpenAI API key is **optional**. The application will run without it, but AI chat features will be disabled.

### To Enable AI Chat Features:

1. **Get an OpenAI API Key:**
   - Visit: https://platform.openai.com/api-keys
   - Sign up or log in
   - Create a new API key

2. **Create a `.env` file in the `backend/` folder:**
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart the backend server**

### What Works Without API Key:

✅ **Recommender System** - Fully functional  
✅ **Product Browsing** - All product endpoints work  
✅ **Cart Management** - Add, remove, update items  
✅ **Group Buying** - All group buy features  
✅ **EarthScore** - Product sustainability ratings  
✅ **Filtering & Search** - Product filtering works  

❌ **AI Chat** - Disabled (returns helpful message instead of error)

### Example .env file:

```env
# OpenAI API Key (Optional - for AI chat features)
OPENAI_API_KEY=sk-your-key-here

# Optional: Specify LLM provider
# ORCHESTRATOR_PROVIDER=openai

# Optional: Redis connection
# REDIS_URL=redis://localhost:6379
```

---

**Note:** The recommender system uses the Apriori algorithm and doesn't require any API keys. It works completely independently!

