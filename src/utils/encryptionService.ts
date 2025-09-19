class EncryptionService {
  private algorithm = "AES-CBC";
  private keyLength = 256;

  /**
   * Derives a key from the encryption key using SHA-256 (matching backend)
   */
  private async deriveKey(encryptionKey: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKey);

    // Hash the key with SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);

    // Take first 32 bytes (like backend: hash.slice(0, 32))
    const keyBuffer = hashBuffer.slice(0, 32);

    // Import the key for AES-CBC
    return await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: this.algorithm },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Converts IV key string to ArrayBuffer (matching backend Buffer.from(IV_KEY, 'utf8'))
   */
  private getIV(ivKey: string): ArrayBuffer {
    const encoder = new TextEncoder();
    const ivData = encoder.encode(ivKey);
    // Use the full IV data as UTF-8 encoded, but ensure it's exactly 16 bytes for AES-CBC
    if (ivData.length < 16) {
      // Pad with zeros if too short
      const paddedIV = new Uint8Array(16);
      paddedIV.set(ivData);
      return paddedIV.buffer;
    } else if (ivData.length > 16) {
      // Truncate if too long (take first 16 bytes)
      return ivData.slice(0, 16).buffer;
    }
    return ivData.buffer;
  }

  /**
   * Encrypts a string using AES-256-CBC (matching backend implementation)
   */
  async encrypt(
    plainText: string,
    encryptionKey: string,
    ivKey: string
  ): Promise<string> {
    try {
      const key = await this.deriveKey(encryptionKey);
      const iv = this.getIV(ivKey);

      const encoder = new TextEncoder();
      const data = encoder.encode(plainText);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        data
      );

      // Convert to hex string and return uppercase (matching backend)
      const hexString = Array.from(new Uint8Array(encrypted))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const result = hexString.toUpperCase();
      console.log("- Encrypted result:", result);

      return result;
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypts a hex string using AES-256-CBC (matching backend implementation)
   */
  async decrypt(
    encryptedHex: string,
    encryptionKey: string,
    ivKey: string
  ): Promise<string> {
    try {
      const key = await this.deriveKey(encryptionKey);
      const iv = this.getIV(ivKey);

      // Debug logging (remove in production)
      console.log("Decryption Debug:");
      console.log("- Input hex:", encryptedHex);
      console.log("- IV length:", iv.byteLength);

      // Convert hex string to ArrayBuffer (matching backend hex input)
      const encryptedData = new Uint8Array(
        encryptedHex
          .toLowerCase()
          .match(/.{1,2}/g)!
          .map((byte) => parseInt(byte, 16))
      );

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        encryptedData
      );

      const decoder = new TextDecoder();
      const result = decoder.decode(decrypted);
      console.log("- Decrypted result:", result);

      return result;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Obscures a string by showing only first 2 characters and characters 8-18 (matching backend)
   */
  obscure(str: string | null | undefined): string | null {
    if (str) {
      return str.substr(0, 2) + "xxxxxx" + str.substr(8, 10);
    }
    return null;
  }

  /**
   * Compares an encrypted string with a plain text string (matching backend)
   */
  async match(
    encryptedString: string,
    stringToBeCompared: string,
    encryptionKey: string,
    ivKey: string
  ): Promise<boolean> {
    try {
      const encrypted = await this.encrypt(
        stringToBeCompared,
        encryptionKey,
        ivKey
      );
      // Use loose equality like backend (==)
      return encryptedString == encrypted;
    } catch (error) {
      return false;
    }
  }
}

export default EncryptionService;
