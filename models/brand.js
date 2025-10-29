// models/brand.js
import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    brandName: { type: String, required: true, unique: true },
    description: { type: String },

    keywords: [{ type: String, required: true }], // base keywords
    includeKeywords: [{ type: String }], // optional filters
    excludeKeywords: [{ type: String }],

    platforms: [{ type: String, enum: ["youtube", "twitter", "reddit"] }],

    language: { type: String, default: "en" },
    country: { type: String, default: "IN" },
    frequency: { type: String, enum: ["5m", "30m", "1h"], default: "30m" },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Brand = mongoose.model("Brand", brandSchema);
