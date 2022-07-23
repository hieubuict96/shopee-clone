import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./route/userRoute.js";
import categoryRouter from './route/categoryRoute.js';
import productRouter from './route/productRoute.js';
import orderRouter from './route/order.js';
import cartRouter from './route/cart.js';
 
dotenv.config();
const app = express();

const PORT = process.env.PORT || 8000;

const __dirWork = path.resolve();

app.use(express.json());
app.use("/public", express.static(path.join(__dirWork, "public")));
app.use(express.static(path.join(__dirWork, "frontend/build")));

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.uhxm6.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`,
    {
      autoIndex: false,
    }
  )
  .then(() => {
    console.log("Database connected");
  });

const httpServer = http.Server(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("connection", socket);
  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRouter);

if (process.env.NODE_ENV) {
  app.get(/^\/(?!api\/)/, (req, res) => {
    res.sendFile(path.join(__dirWork, "frontend", "build", "index.html"));
  });
}

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
