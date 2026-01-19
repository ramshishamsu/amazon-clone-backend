import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  authProvider: {
    type: String,
    default: "local" // local | google
  }
});

export default mongoose.model("User", userSchema);
