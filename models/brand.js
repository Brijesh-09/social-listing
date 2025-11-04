// models/brand.js
import mongoose from "mongoose";

const keywordGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  keywords: [{ type: String, required: true }],
  includeKeywords: [{ type: String }],
  excludeKeywords: [{ type: String }],
  platforms: [{ type: String, enum: ["youtube", "twitter", "reddit", "facebook", "instagram"] }],
  language: { type: String, default: "en" },
  country: { type: String, default: "IN" },
  frequency: { type: String, enum: ["5m", "30m", "1h"], default: "30m" },
  assignedUsers: [{ type: String }],
});

const brandSchema = new mongoose.Schema(
  {
    brandName: { type: String, required: true, unique: true },
    description: { type: String },
    keywordGroups: [keywordGroupSchema],
    assignedUsers: [{ type: String }],
    frequency: { type: String, enum: ["5m", "30m", "1h"], default: "30m" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Brand = mongoose.model("Brand", brandSchema);
