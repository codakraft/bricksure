import { useState } from "react";
import { useSignUpMutation } from "../services/authService";
import { Layout } from "./Layout/Layout";

export function ApiEncryptionTest() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  // const [register] = useRegisterMutation();
  const [signUp] = useSignUpMutation();

  const testRTKQueryEncryption = async () => {
    setIsLoading(true);
    setTestResult("Testing RTK Query encryption...\n");

    try {
      const testData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
        phoneNumber: "+1234567890",
      };

      setTestResult(
        (prev) =>
          prev + `📤 Sending data: ${JSON.stringify(testData, null, 2)}\n`
      );

      const result = await signUp(testData).unwrap();

      setTestResult(
        (prev) => prev + `📥 Response: ${JSON.stringify(result, null, 2)}\n`
      );
      setTestResult((prev) => prev + "✅ Encryption test completed!\n");
    } catch (error) {
      setTestResult(
        (prev) => prev + `❌ Error: ${JSON.stringify(error, null, 2)}\n`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-8">
              🔐 API Encryption Test
            </h1>

            <button
              onClick={testRTKQueryEncryption}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 mb-6"
            >
              {isLoading ? "Testing..." : "Test RTK Query Encryption"}
            </button>

            <div className="bg-gray-100 rounded-lg p-4 min-h-[300px]">
              <h3 className="font-semibold mb-4">Test Results:</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {testResult || "Click the button to test encryption"}
              </pre>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                How it works:
              </h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• POST/PUT requests are automatically encrypted</li>
                <li>• Responses are automatically decrypted</li>
                <li>• Uses AES-256-CBC with Web Crypto API</li>
                <li>• Check Network tab to see encrypted payloads</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
