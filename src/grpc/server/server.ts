import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { AuthService } from "../../services/auth.service";

const AUTH_PROTO_PATH = path.join(__dirname, "../proto/auth.proto");
const authPackageDefinition = protoLoader.loadSync(AUTH_PROTO_PATH);
const authProto = grpc.loadPackageDefinition(authPackageDefinition)
  .Authenticate as any;

const server = new grpc.Server();

server.addService(authProto.AuthService.service, {
  GenerateTokens: async (call: any, callback: any) => {
    const { userId, email } = call.request;
    try {
      const tokens = await AuthService.generateTokens({ userId, email });
      callback(null, { tokens, message: "Tokens generated successfully" });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: "Internal server error",
      });
    }
  },

  VerifyTokens: async (call: any, callback: any) => {
    const { accessToken, refreshToken } = call.request;
    try {
      const userData = await AuthService.verifyTokens({
        accessToken,
        refreshToken,
      });
      callback(null, { ...userData, message: "Tokens are valid" });
    } catch (error) {
      callback({ code: grpc.status.UNAUTHENTICATED, message: "Unauthorized" });
    }
  },

  RefreshTokens: async (call: any, callback: any) => {
    const { refreshToken } = call.request;
    try {
      const tokens = await AuthService.refresh(refreshToken);
      callback(null, { tokens, message: "Tokens refreshed successfully" });
    } catch (error) {
      callback({ code: grpc.status.UNAUTHENTICATED, message: "Unauthorized" });
    }
  },
});

export const startAuthGrpcServer = (retryCount = 0) => {
  const basePort = parseInt(process.env.GRPC_PORT!) || 50051;
  const maxRetries = 5;
  const port = basePort + retryCount;

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
        if (err) {
            if (retryCount < maxRetries) {
              console.log(`Port ${port} in use, trying port ${port + 1}...`);
              startAuthGrpcServer(retryCount + 1);
            } else {
              console.error("Failed to start gRPC server after multiple attempts:", err);
            }
            return;
          }
      console.log("Auth gRPC server running on port", port);
    }
  );
};
