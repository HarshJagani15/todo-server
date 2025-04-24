import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongodbDatabase } from "./config/connectDB";
import type { NextFunction, Request, Response } from "express";
import { authRoutes } from "./routes/auth-routes";
import { panelRoutes } from "./routes/panel-routes";
import { todoRoutes } from "./routes/todo-routes";
import path from "path";
import { verifyFacebookToken } from "./core/middleware/facebook-auth";
import { verifyGitHubToken } from "./core/middleware/github-auth";
import { authentication } from "./core/middleware/authentication";
import { userRoutes } from "./routes/user-routes";

dotenv.config();
connectMongodbDatabase();

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["New-Access-Token"],
};

app.use(cors(corsOptions));

app.use(express.json());

const excludeAuthPaths = (req: Request, res: Response, next: NextFunction) => {
  const excludedPaths: string[] = [
    "/api/v1/auth/signin",
    "/api/v1/auth/signup",
    "/api/v1/auth/refresh-token",
  ];
  if (excludedPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }
  const token = req.headers.authorization?.split(" ")[1];

  if (token?.startsWith("EAA")) {
    return verifyFacebookToken(req, res, next);
  }

  if (/^gh[p|o]_[A-Za-z0-9]+$/.test(token!)) {
    return verifyGitHubToken(req, res, next);
  }

  return authentication(req, res, next);
};

app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/", express.static(path.join(__dirname, "./uploads")));

app.use((req: Request, res: Response, next: NextFunction) => {
  excludeAuthPaths(req, res, next);
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/user", userRoutes);

app.use("/api/v1/panels", panelRoutes);

app.use("/api/v1/todos", todoRoutes);

const PORT = process.env.PORT! || 4000;
app.listen(+PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`);
});
