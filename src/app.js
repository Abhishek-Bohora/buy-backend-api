import express from "express";
import { createServer } from "http";
import cors from "cors";
import userRouter from "./routes/auth/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import cartRouter from "./routes/cart.routes.js";

const app = express();
const httpServer = createServer(app);

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

app.use("/api/v1/users", userRouter);

app.use("/api/v1/ecommerce/categories", categoryRouter);
app.use("/api/v1/ecommerce/product", productRouter);

app.use("/api/v1/ecommerce/cart", cartRouter);

app.use("/api/v1/ecommerce/orders", orderRouter);

export { httpServer };
