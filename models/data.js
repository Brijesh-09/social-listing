// models/data.js
import mongoose from "mongoose";

const socialPostSchema = new mongoose.Schema(
  {
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    keywordGroup: { type: String, required: true },
    keyword: { type: String, required: true },

    platform: {
      type: String,
      enum: ["twitter", "youtube", "reddit", "facebook", "instagram"],
      required: true,
    },

    createdAt: { type: Date, required: true },
    author: { id: String, name: String },
    content: { text: String, description: String, mediaUrl: String },
    metrics: { likes: Number, comments: Number, shares: Number, views: Number },
    sourceUrl: String,
    analysis: { sentiment: String, keywords: [String], engagementScore: Number },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

socialPostSchema.index({ brand: 1, keywordGroup: 1, keyword: 1, platform: 1 });

export const SocialPost = mongoose.model("SocialPost", socialPostSchema);
