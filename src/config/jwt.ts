import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpiry
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiry
  });
};

export const verifyAccessToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, config.jwt.accessTokenSecret) as jwt.JwtPayload;
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, config.jwt.refreshTokenSecret) as jwt.JwtPayload;
};