import express from "express";
import { createServer } from "http";

import userRouter from "./routes/auth/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
const app = express();
const httpServer = createServer(app);
app.use(express.json());

app.use("/api/v1/users", userRouter);

app.use("/api/v1/ecommerce/categories", categoryRouter);

export { httpServer };
