import Cart from "../models/Cart.js";

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 */
export const getCart = async (req, res) => {
  try {
    console.log("Getting cart for user:", req.user.id);
    
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId");

    console.log("Cart found:", cart);
    console.log("Cart items:", cart?.items || []);

    if (!cart) {
      console.log("No cart found for user, creating empty cart response");
      return res.json({ items: [], totalAmount: 0 });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      return total + (item.productId?.price || 0) * item.quantity;
    }, 0);

    const response = {
      items: cart.items,
      totalAmount: totalAmount
    };

    console.log("Returning cart response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/cart/add
 */
export const addToCart = async (req, res) => {
  const { productId } = req.body;
  
  try {
    console.log("Adding product to cart:", productId);
    console.log("User ID:", req.user.id);
    
    let cart = await Cart.findOne({ userId: req.user.id });
    console.log("Existing cart:", cart);

    if (!cart) {
      console.log("Creating new cart for user");
      cart = await Cart.create({
        userId: req.user.id,
        items: [{ productId, quantity: 1 }]
      });
      console.log("New cart created:", cart);
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
        console.log("Updated quantity for existing item");
      } else {
        cart.items.push({ productId, quantity: 1 });
        console.log("Added new item to cart");
      }
    }

    await cart.save();
    console.log("Cart saved successfully");
    
    // Populate before returning
    const populatedCart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId");
    
    // Calculate total amount
    const totalAmount = populatedCart.items.reduce((total, item) => {
      return total + (item.productId?.price || 0) * item.quantity;
    }, 0);

    const response = {
      items: populatedCart.items,
      totalAmount: totalAmount
    };
    
    console.log("Returning cart response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Increase quantity
 * @route   PUT /api/cart/increase
 */
export const increaseQty = async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ userId: req.user.id });

  const item = cart.items.find(
    item => item.productId.toString() === productId
  );

  if (item) item.quantity += 1;

  await cart.save();
  res.json(cart);
};

/**
 * @desc    Decrease quantity
 * @route   PUT /api/cart/decrease
 */
export const decreaseQty = async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ userId: req.user.id });

  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      cart.items.splice(itemIndex, 1);
    }
  }

  await cart.save();
  res.json(cart);
};

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/cart/remove/:productId
 */
export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });

  cart.items = cart.items.filter(
    item => item.productId.toString() !== req.params.productId
  );

  await cart.save();
  res.json(cart);
};
