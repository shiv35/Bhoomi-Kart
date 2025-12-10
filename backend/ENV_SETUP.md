# Environment Variables Setup

## Gemini API Key (required for AI chat)

AI chat now uses Google Gemini. The rest of the app works without it.

### To Enable AI Chat Features:

1. **Get a Gemini API Key:**
   - Visit: https://aistudio.google.com/app/apikey
   - Create a free API key

2. **Create a `.env` file in the `backend/` folder:**
   ```env
   GEMINI_API_KEY=your-gemini-api-key
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
# Gemini API Key (Required for AI chat features)
GEMINI_API_KEY=your-gemini-api-key

# Optional: Redis connection
# REDIS_URL=redis://localhost:6379
```

---

**Note:** The recommender system uses the Apriori algorithm and doesn't require any API keys. It works completely independently!

