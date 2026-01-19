import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/increase", protect, increaseQty);
router.put("/decrease", protect, decreaseQty);
router.delete("/remove/:productId", protect, removeFromCart);

export default router;
