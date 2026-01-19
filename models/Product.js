import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: String,
  rating: Number,
  comment: String
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: [String],
  rating: Number,
  reviews: [reviewSchema],
  category: String,
  stock: Number
});

export default mongoose.model("Product", productSchema);
