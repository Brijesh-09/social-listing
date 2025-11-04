// // controllers/data.controller.js
import { Brand } from "../models/brand.js";
import { SocialPost } from "../models/data.js";

export const getPostsByBrand = async (req, res) => {
  try {
    const {
      brandName,
      platform,     // optional (youtube/twitter/reddit)
      keyword,      // optional
      limit = 20,
      sort = "desc" // newest first by default
    } = req.query;

    if (!brandName) {
      return res.status(400).json({
        success: false,
        message: "brandName query parameter is required"
      });
    }

    // 🔍 find the brand first
    const brand = await Brand.findOne({ brandName });
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found"
      });
    }

    // 🧩 Build query filter
    const filter = { brand: brand._id };
    if (platform) filter.platform = platform;
    if (keyword) filter.keyword = keyword;

    const sortOrder = sort === "asc" ? 1 : -1;

    const posts = await SocialPost.find(filter)
      .populate("brand", "brandName")
      .sort({ createdAt: sortOrder })
      .limit(Number(limit))
      .exec();

    res.json({
      success: true,
      brand: brandName,
      count: posts.length,
      filters: { platform: platform || "all", keyword: keyword || "all" },
      data: posts
    });
  } catch (err) {
    console.error("Error fetching brand posts:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// export const getAllKeywordsByBrand = async (req, res) => {
//   try {
//     const { brandName } = req.query;

//     if (!brandName) {
//       return res
//         .status(400)
//         .json({ success: false, message: "brandName query parameter is required" });
//     }

//     const brand = await Brand.findOne({ brandName });
//     if (!brand) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Brand not found" });
//     }

//     const keywords = await SocialPost.distinct("keyword", { brand: brand._id });

//     res.json({
//       success: true,
//       brand: brandName,
//       count: keywords.length,
//       keywords
//     });
//   } catch (err) {
//     console.error("Error fetching brand keywords:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message
//     });
//   }
// };
