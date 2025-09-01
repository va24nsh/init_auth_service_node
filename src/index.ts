import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import { errorHandler } from "./middlewares/errorMiddleware";
import { startAuthGrpcServer } from "./grpc/server/server";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/token", authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

startAuthGrpcServer();

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

export default app;
