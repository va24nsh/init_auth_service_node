import bcrypt from "bcrypt";
import { generateTokens, verifyRefreshToken } from "../utils/token";
import { redis } from "../lib/redis";

export class AuthService {
  static async generateTokens({ userId, email }: { userId: string, email: string }) {
    const tokens = generateTokens({ userId, email });
    
    // Store the accessToken and refreshToken's hash in Redis
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await redis.set(tokens.accessToken, JSON.stringify({ userId, email, refreshToken: hashedRefreshToken }), 'EX', 7 * 24 * 60 * 60);

    return tokens;
  }

  static async verifyTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    if (!accessToken || !refreshToken) {
      throw new Error("Tokens are required");
    }

    // Fetch accessToken from Redis and compare the refreshToken's hash
    const storedData = await redis.get(accessToken);
    if (!storedData) {
      throw new Error("Invalid tokens");
    }
    const { userId, email, refreshToken: hashedRefreshToken } = JSON.parse(storedData);

    // Uncomment later and complete code with redis
    const isMatch = await bcrypt.compare(refreshToken, hashedRefreshToken);
    if(!isMatch) {
      throw new Error("Invalid tokens");
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error("Invalid refresh token");
    }
    return { userId, email };
  }

  static async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error("Invalid refresh token");
    }

    const tokens = generateTokens({ userId: payload.userId, email: payload.email });

    // Store the accessToken and refreshToken's hash in Redis
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await redis.set(tokens.accessToken, JSON.stringify({ userId: payload.userId, email: payload.email, refreshToken: hashedRefreshToken }), 'EX', 7 * 24 * 60 * 60);

    return tokens;
  }
}