import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongodbDatabase } from "./config/connectDB";
import { authRoutes } from "./routes/auth-routes";
import { panelRoutes } from "./routes/panel-routes";
import { todoRoutes } from "./routes/todo-routes";
import path from "path";
import { userRoutes } from "./routes/user-routes";
import globalErrorHandler from "./core/middleware/error-handler";
import { excludeAuthPaths } from "./utils/exclude-auth-path";

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["New-Access-Token"],
};

app.use(cors(corsOptions));

dotenv.config();

connectMongodbDatabase();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/", express.static(path.join(__dirname, "./uploads")));

app.use(excludeAuthPaths);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/user", userRoutes);

app.use("/api/v1/panels", panelRoutes);

app.use("/api/v1/todos", todoRoutes);

app.use(globalErrorHandler);

const PORT = process.env.PORT! || 4000;
app.listen(+PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`);
});
