import Product from "../models/Product.js";

/**
 * @desc    Get all products with filters
 * @route   GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    const { category, rating, minPrice, maxPrice, search } = req.query;

    let filters = [];

    // Category filter
    if (category) {
      filters.push({
        category: { $regex: `^${category}$`, $options: "i" }
      });
    }

    // Rating filter
    if (rating) {
      filters.push({
        rating: { $gte: Number(rating) }
      });
    }

    // Price filter
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);

      filters.push({ price: priceFilter });
    }

    // Search filter
    if (search) {
      filters.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } }
        ]
      });
    }

    const query = filters.length ? { $and: filters } : {};

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create product (demo/admin)
 * @route   POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
