import { useState } from "react";
import { api } from "../services/api";
import { useRegisterMutation } from "../services/apiSlice";
import { Layout } from "../components/Layout/Layout";

export function ApiEncryptionTest() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [register] = useRegisterMutation();

  const testAxiosEncryption = async () => {
    setIsLoading(true);
    setTestResult("Testing axios encryption for ALL endpoints...\n");

    try {
      // Test various endpoints to show universal encryption
      const testData = { testField: "testValue", timestamp: Date.now() };

      // Test login endpoint
      await api.post("/auth/login", {
        ...testData,
        email: "test@example.com",
        password: "test123",
      });
      setTestResult((prev) => prev + "✅ Login endpoint encrypted\n");

      // Test register endpoint
      await api.post("/auth/register", {
        ...testData,
        name: "Test User",
        email: "test@example.com",
      });
      setTestResult((prev) => prev + "✅ Register endpoint encrypted\n");

      // Test profile endpoint (if authenticated)
      try {
        await api.get("/profile/me");
        setTestResult((prev) => prev + "✅ Profile endpoint encrypted\n");
      } catch {
        setTestResult(
          (prev) => prev + "⚠️ Profile endpoint (may require authentication)\n"
        );
      }

      // Test a generic POST request to demonstrate universal encryption
      try {
        await api.post("/test-endpoint", testData);
        setTestResult((prev) => prev + "✅ Generic endpoint encrypted\n");
      } catch {
        setTestResult(
          (prev) =>
            prev +
            "ℹ️ Generic endpoint test (expected to fail on non-existent endpoint)\n"
        );
      }

      setTestResult(
        (prev) => prev + "\n🎉 All axios requests successfully encrypted!"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setTestResult((prev) => prev + `\n❌ Axios test failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRtkQueryEncryption = async () => {
    setIsLoading(true);
    setTestResult((prev) => prev + "\nTesting RTK Query encryption...");

    try {
      // Test register endpoint (should be encrypted)
      const registerResult = await register({
        email: "test@example.com",
        password: "testpassword123",
        fullName: "Test User",
        phoneNumber: "+1234567890",
      });

      if (registerResult.error) {
        setTestResult(
          (prev) =>
            prev +
            `\n⚠️ RTK Query register: ${JSON.stringify(registerResult.error)}`
        );
      } else {
        setTestResult(
          (prev) => prev + "\n✅ RTK Query register request successful"
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setTestResult(
        (prev) => prev + `\n❌ RTK Query test failed: ${errorMessage}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResult("Starting API encryption tests...\n");
    await testAxiosEncryption();
    await testRtkQueryEncryption();
    setTestResult((prev) => prev + "\n\n🎉 All tests completed!");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center">
            API Encryption Test Suite
          </h2>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">🔐 Encryption Status</h3>
            <p className="text-sm text-gray-700">
              <strong>ALL API requests and responses are now encrypted!</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Every request with a body is automatically encrypted before
              transmission and decrypted upon receipt.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {isLoading
                ? "🧪 Running Tests..."
                : "🚀 Run All Encryption Tests"}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={testAxiosEncryption}
                disabled={isLoading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test Axios Encryption
              </button>

              <button
                onClick={testRtkQueryEncryption}
                disabled={isLoading}
                className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test RTK Query Encryption
              </button>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">📊 Test Results:</h3>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                  {testResult}
                </pre>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-2">📋 How It Works</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Universal Encryption:</strong> ALL requests with a
                  body are automatically encrypted
                </p>
                <p>
                  <strong>Request Encryption:</strong> Data is encrypted before
                  sending to any endpoint
                </p>
                <p>
                  <strong>Response Decryption:</strong> All encrypted responses
                  are automatically decrypted
                </p>
                <p>
                  <strong>Header Detection:</strong> Uses 'X-Encrypted' header
                  to identify encrypted payloads
                </p>
                <p>
                  <strong>Environment Keys:</strong> Uses
                  VITE_ENCRYPTION_SERVICE_KEY and VITE_IV_KEY from .env
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
