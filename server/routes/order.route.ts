import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  createOrder,
  createOrderRP,
  getAllOrders,
  newPayment,
  sendStripePublshableKey,
  verifyPayment,
} from "../controllers/order.controller";
const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.get(
  "/get-orders",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrders
);

orderRouter.get("/payment/stripepublisahblekey", sendStripePublshableKey);
orderRouter.post("/payment", isAuthenticated, newPayment);
orderRouter.post("/create-order-rp", isAuthenticated, createOrderRP);
orderRouter.post("/verify-payment", isAuthenticated, verifyPayment);


export default orderRouter;
