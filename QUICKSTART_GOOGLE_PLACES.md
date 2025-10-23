# Quick Start: Google Places Autocomplete

## 🚀 Quick Setup (5 minutes)

### 1. Get Your API Key

Visit: https://console.cloud.google.com/

1. Create/select a project
2. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
3. Create API Key (Credentials → Create Credentials → API Key)
4. Copy the API key

### 2. Add to Environment

Create `.env` file (if it doesn't exist):
```bash
cp .env.example .env
```

Update the Google Maps API key in `.env`:
```bash
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourActualAPIKeyHere
```

### 3. Restart Server

```bash
npm run dev
```

### 4. Test It Out

1. Go to Dashboard → Get Quote
2. Fill in property details until you reach "Enter Property Location"
3. Start typing an address (e.g., "1 Victoria Island")
4. You should see autocomplete suggestions! ✨

## ⚠️ Important Notes

- **Never commit** your `.env` file
- The `.env.example` should only contain placeholder text
- If no API key is set, it falls back to regular text input
- First $200/month is free from Google (covers ~28,000 requests)

## 🔧 Troubleshooting

**Not seeing suggestions?**
- Check browser console for errors
- Verify API key is correct in `.env`
- Ensure Places API is enabled in Google Cloud
- Restart dev server after adding API key

**API Key Errors?**
- Check API restrictions in Google Cloud Console
- Ensure Places API is enabled
- Verify billing is enabled (required even for free tier)

## 📚 Full Documentation

See `GOOGLE_PLACES_SETUP.md` for detailed setup instructions.

## 🎯 What You Get

When a user selects an address, you get:
- ✅ Formatted address string
- ✅ Latitude/Longitude coordinates
- ✅ Address components (street, city, state, postal code)
- ✅ Place ID for future reference

This data can be used to:
- Auto-fill state/LGA fields
- Calculate risk based on location
- Verify addresses are in Nigeria
- Show location on a map
