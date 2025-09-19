import { useCallback } from 'react';
import EncryptionService from './encryptionService';

interface EncryptionConfig {
  encryptionKey: string;
  ivKey: string;
}

export const useEncryption = (config: EncryptionConfig) => {
  const encryptionService = new EncryptionService();

  const encrypt = useCallback(async (plainText: string): Promise<string> => {
    return await encryptionService.encrypt(plainText, config.encryptionKey, config.ivKey);
  }, [config.encryptionKey, config.ivKey]);

  const decrypt = useCallback(async (encryptedHex: string): Promise<string> => {
    return await encryptionService.decrypt(encryptedHex, config.encryptionKey, config.ivKey);
  }, [config.encryptionKey, config.ivKey]);

  const obscure = useCallback((str: string | null | undefined): string | null => {
    return encryptionService.obscure(str);
  }, []);

  const match = useCallback(async (encryptedString: string, stringToBeCompared: string): Promise<boolean> => {
    return await encryptionService.match(encryptedString, stringToBeCompared, config.encryptionKey, config.ivKey);
  }, [config.encryptionKey, config.ivKey]);

  return {
    encrypt,
    decrypt,
    obscure,
    match
  };
};