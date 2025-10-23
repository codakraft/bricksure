import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import EncryptionService from "../utils/encryptionService";
import { RootState } from "../store/store";

// Initialize encryption service
const encryptionService = new EncryptionService();

// Environment variables for encryption keys (matching backend variable names)
const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_SERVICE_KEY || "default-encryption-key-2023";
const IV_KEY = import.meta.env.VITE_IV_KEY || "default-iv-key-16";

// Custom base query with auth token handling and error handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "https://bricksure-api.onrender.com",
  prepareHeaders: (headers, { getState, endpoint }) => {
    const localToken = localStorage.getItem("bricksure-token");
    console.log("Endpoint:", endpoint);
    const { token } = (getState() as RootState).auth;
    // console.log("Preparing headers with token:", token, localToken);
    
    // Skip auth token for getSeaLevel endpoint
    if (endpoint !== "getSeaLevel" && token) {
      headers.set("authorization", `Bearer ${token || localToken}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// Dynamic base query that uses different base URLs based on endpoint
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

// Enhanced base query with encryption/decryption and error handling
const baseQueryWithErrorHandling = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  let modifiedArgs = { ...args };

  // Skip encryption for getSeaLevel endpoint
  const shouldEncrypt = api.endpoint !== 'getSeaLevel';

  // Encrypt request body for POST and PUT requests
  if (shouldEncrypt && args.body && (args.method === "POST" || args.method === "PUT")) {
    try {
      const bodyString =
        typeof args.body === "string" ? args.body : JSON.stringify(args.body);
      const encryptedBody = await encryptionService.encrypt(
        bodyString,
        ENCRYPTION_KEY,
        IV_KEY
      );
      modifiedArgs = {
        ...args,
        body: { data: encryptedBody },
      };
    } catch (error) {
      console.error("Encryption error:", error);
      // If encryption fails, proceed with original request
    }
  }

  const result = await dynamicBaseQuery(modifiedArgs, api, extraOptions);

  // Handle 401 errors
  if (result.error && result.error.status === 401) {
    localStorage.removeItem("bricksure-token");
    window.location.href = "/login";
    return result;
  }

  // Skip decryption for getSeaLevel endpoint
  const shouldDecrypt = api.endpoint !== 'getSeaLevel';

  // Decrypt response data if present
  // console.log("Raw response data:", result.data.data, typeof result.data);
  if (shouldDecrypt && result.data && typeof result.data === "object") {
    // console.log("Raw response data:", result.data, typeof result.data);
    try {
      const decryptedData = await encryptionService.decrypt(
        (result.data as any).data,
        ENCRYPTION_KEY,
        IV_KEY
      );
      console.log("Decrypted response data:", decryptedData);
      return {
        ...result,
        data: JSON.parse(decryptedData),
      };
    } catch (error) {
      console.error("Decryption error:", error);
      // If decryption fails, return original response
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["User", "Property", "Quote", "Policy", "Wallet", "Transaction"],
  endpoints: () => ({}),
});
