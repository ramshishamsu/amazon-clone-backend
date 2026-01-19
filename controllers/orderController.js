import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

/**
 * @desc    Place order (Checkout)
 * @route   POST /api/orders
 */
export const placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    const order = await Order.create({
      userId: req.user.id,
      items: cart.items,
      totalAmount,
      status: "Placed"
    });

    // Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/my-orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
