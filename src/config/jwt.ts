import jwt from 'jsonwebtoken';
import { config } from '../config/config';

interface TokenPayload {
  userId: string;
  role?: string;
}

// Helper function to validate and format expiresIn
const getExpiresIn = (expiry: string): string | number => {
  // If it's a number string (e.g., "3600"), convert to number
  if (/^\d+$/.test(expiry)) {
    return parseInt(expiry, 10);
  }
  // Otherwise keep as string (e.g., "15m", "1h")
  return expiry;
};

export const generateAccessToken = (userId: string, role: string): string => {
  const payload: TokenPayload = { userId, role };
  const options: jwt.SignOptions = { 
    expiresIn: getExpiresIn(config.jwt.accessTokenExpiry) as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256'
  };
  
  return jwt.sign(payload, config.jwt.accessTokenSecret as jwt.Secret, options);
};

export const generateRefreshToken = (userId: string): string => {
  const payload: TokenPayload = { userId };
  const options: jwt.SignOptions = {
    expiresIn: getExpiresIn(config.jwt.accessTokenExpiry) as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256'
  };
  
  return jwt.sign(payload, config.jwt.refreshTokenSecret as jwt.Secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessTokenSecret as jwt.Secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshTokenSecret as jwt.Secret) as TokenPayload;
};