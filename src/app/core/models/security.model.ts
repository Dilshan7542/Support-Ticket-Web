export interface KeyExchangeRequest {
  clientPublicKey: string;
}

export interface KeyExchangeResponse {
  keyId: string;
  serverPublicKey: string;
  salt: string;
  curve: string;
  keyDerivation: string;
  encryptionAlgorithm: string;
  expiresAt: string;
}

export interface KeyExchangeSession extends KeyExchangeResponse {
  aesKey?: CryptoKey;
}

export interface EncryptedPayload {
  iv: string;
  cipherText: string;
}
