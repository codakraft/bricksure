# Google Places Autocomplete Setup

This guide will help you set up Google Places Autocomplete for the property location input in the BrickSure application.

## Prerequisites

You need a Google Cloud Platform account and a Google Maps API key with the Places API enabled.

## Step 1: Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API** (optional, but recommended)

4. Create credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **API Key**
   - Copy your API key

## Step 2: Restrict Your API Key (Recommended)

For security, restrict your API key:

1. In the Credentials page, click on your API key
2. Under **API restrictions**, select "Restrict key"
3. Enable only the APIs you need:
   - Maps JavaScript API
   - Places API
   - Geocoding API

4. Under **Website restrictions**, add your domain:
   - For development: `localhost`
   - For production: `yourdomain.com`

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root directory (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Add your Google Maps API key to the `.env` file:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
   ```

3. **Important**: Never commit your `.env` file to version control. Make sure it's in your `.gitignore`.

## Step 4: Restart Your Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
```

## Features

The Google Places Autocomplete integration provides:

- **Address suggestions** as you type
- **Restricted to Nigeria** (country: "ng") for relevant results
- **Automatic fallback** to regular text input if the API key is not configured
- **Place details** including:
  - Formatted address
  - Coordinates (latitude/longitude)
  - Address components (street, city, state, postal code)
  - Place ID

## Usage in the Application

The property location input now uses Google Places Autocomplete:

1. Navigate to **Get Quote** in the dashboard
2. When you reach the "Enter Property Location" question
3. Start typing an address in Nigeria
4. Select from the suggested addresses
5. The complete address will be automatically filled in

## Troubleshooting

### Autocomplete not working

1. Check that your API key is correctly set in the `.env` file
2. Verify that the Places API is enabled in Google Cloud Console
3. Check the browser console for any error messages
4. Ensure your API key restrictions allow requests from your domain

### API Key Errors

If you see errors like "This API key is not authorized":
1. Check API restrictions in Google Cloud Console
2. Make sure the Places API is enabled
3. Verify website restrictions allow your domain

### Fallback to Regular Input

If the Google Places input doesn't load, the component will automatically fall back to a regular text input. This ensures the form always works, even if:
- No API key is configured
- The API key is invalid
- There are network issues

## Cost Considerations

Google Places Autocomplete is a paid service, but Google provides:
- $200 monthly credit (covers ~28,000 autocomplete requests)
- Pay-as-you-go pricing after credit is exhausted

For pricing details, visit: [Google Maps Platform Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)

## Additional Resources

- [Google Places Autocomplete Documentation](https://developers.google.com/maps/documentation/javascript/place-autocomplete)
- [React Google Maps API Documentation](https://react-google-maps-api-docs.netlify.app/)
