# Dynamic Base URL Configuration for Sea Level API

## Summary

Modified the API service to use different base URLs based on the endpoint being called. The `getSeaLevel` endpoint now uses `https://location-risks-service.vercel.app` while all other endpoints use the default BrickSure API URL.

## Changes Made

### File: `src/services/api.ts`

#### 1. Updated `baseQueryWithAuth` (Lines 13-28)
- Added check to skip auth token for `getSeaLevel` endpoint
- Sea level service doesn't require BrickSure authentication

```typescript
// Skip auth token for getSeaLevel endpoint
if (endpoint !== "getSeaLevel" && token) {
  headers.set("authorization", `Bearer ${token || localToken}`);
}
```

#### 2. Created `dynamicBaseQuery` (Lines 30-48)
- New function that routes requests to different base URLs based on endpoint
- Checks if endpoint is `getSeaLevel` and uses external service URL
- Falls back to default base query for all other endpoints

```typescript
const dynamicBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const { endpoint } = api;
  
  // Use different base URL for getSeaLevel endpoint
  if (endpoint === 'getSeaLevel') {
    const seaLevelBaseQuery = fetchBaseQuery({
      baseUrl: 'https://location-risks-service.vercel.app',
      prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/json");
        return headers;
      },
    });
    return seaLevelBaseQuery(args, api, extraOptions);
  }
  
  // Use default base query for all other endpoints
  return baseQueryWithAuth(args, api, extraOptions);
};
```

#### 3. Updated `baseQueryWithErrorHandling` (Lines 50-110)
- Added encryption skip for `getSeaLevel` endpoint
- Added decryption skip for `getSeaLevel` endpoint
- Changed to use `dynamicBaseQuery` instead of `baseQueryWithAuth`

```typescript
// Skip encryption for getSeaLevel endpoint
const shouldEncrypt = api.endpoint !== 'getSeaLevel';

// Skip decryption for getSeaLevel endpoint
const shouldDecrypt = api.endpoint !== 'getSeaLevel';
```

### File: `src/services/quotesService.ts`

No changes needed. The endpoint configuration remains simple:

```typescript
getSeaLevel: builder.mutation<SeaLevelResponse, { location: string }>({
  query: (body) => ({
    url: "/sea-level",
    method: "POST",
    body,
  }),
}),
```

## How It Works

### Request Flow for `getSeaLevel`:

1. **User selects address** → `getSeaLevel({ location: "Victoria Island, Lagos" })` is called
2. **dynamicBaseQuery** detects endpoint is `getSeaLevel`
3. **Special base query created** with URL: `https://location-risks-service.vercel.app`
4. **Request sent to**: `https://location-risks-service.vercel.app/sea-level`
5. **No encryption** applied to request body
6. **Response received** directly (no decryption)
7. **Data returned** as-is to component

### Request Flow for Other Endpoints (e.g., `createQuote`):

1. **User submits quote** → `createQuote(data)` is called
2. **dynamicBaseQuery** detects endpoint is NOT `getSeaLevel`
3. **Default base query used** with URL: `https://bricksure-api.onrender.com`
4. **Request sent to**: `https://bricksure-api.onrender.com/api/v1/property/quote`
5. **Encryption** applied to request body
6. **Auth token** added to headers
7. **Response received** and **decrypted**
8. **Decrypted data** returned to component

## Configuration Summary

| Endpoint | Base URL | Auth Token | Encryption | Decryption |
|----------|----------|------------|------------|------------|
| `getSeaLevel` | `https://location-risks-service.vercel.app` | ❌ No | ❌ No | ❌ No |
| `createQuote` | `https://bricksure-api.onrender.com` | ✅ Yes | ✅ Yes | ✅ Yes |
| `getCharges` | `https://bricksure-api.onrender.com` | ✅ Yes | ✅ Yes | ✅ Yes |
| All other endpoints | `https://bricksure-api.onrender.com` | ✅ Yes | ✅ Yes | ✅ Yes |

## Testing

### Test getSeaLevel Endpoint:
1. Navigate to Get Quote form
2. Enter property location
3. Select an address from Google Places
4. Check Network tab:
   - URL should be: `https://location-risks-service.vercel.app/sea-level`
   - Request body should be plain JSON (not encrypted)
   - No Authorization header
5. Check Console:
   - "Sea Level Data:" should show plain response
   - No decryption logs

### Test Other Endpoints:
1. Submit a quote or access any other API feature
2. Check Network tab:
   - URL should be: `https://bricksure-api.onrender.com/api/v1/...`
   - Request body should contain encrypted data object
   - Authorization header should be present
3. Check Console:
   - "Decrypted response data:" should appear
   - Decryption logs should be visible

## Benefits

✅ **Separation of Concerns**: External services use their own URLs
✅ **Security**: No unnecessary encryption for external APIs
✅ **Flexibility**: Easy to add more external services with custom configurations
✅ **Maintainability**: Centralized logic for routing requests
✅ **No Breaking Changes**: All existing endpoints continue to work as before

## Future Enhancements

1. **Environment Variables**: Move external service URLs to `.env` file
2. **Service Registry**: Create a configuration object for all external services
3. **Retry Logic**: Add specific retry strategies for external services
4. **Timeout Configuration**: Set different timeouts for different services
5. **Error Handling**: Custom error messages based on service type

## Notes

- The `any` type warnings in ESLint are pre-existing and don't affect functionality
- External services (like sea level API) don't go through encryption/decryption pipeline
- All BrickSure internal APIs continue to use encrypted communication
- This pattern can be extended for other external integrations (weather, maps, etc.)
