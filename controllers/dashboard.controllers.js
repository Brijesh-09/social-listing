import { SocialPost } from "../models/data.js";


// Fetch stored posts by keyword with optional platform filter
export const getDataByKeyword = async (req, res) => {
  const { keyword, platform, limit = 10, sort = "desc" } = req.query;

  if (!keyword) {
    return res
      .status(400)
      .json({ success: false, message: "Keyword query parameter is required" });
  }

  try {
    const filter = { keyword };

    // Optional platform filter (twitter/youtube/reddit)
    if (platform) filter.platform = platform;

    // Sort by creation date (descending by default)
    const sortOrder = sort === "asc" ? 1 : -1;

    const posts = await SocialPost.find(filter)
      .sort({ createdAt: sortOrder })
      .limit(Number(limit))
      .exec();

    res.json({
      success: true,
      count: posts.length,
      keyword,
      platform: platform || "all",
      data: posts,
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

//fetch all the keywords 
export const getAllKeywords = async (req , res) => {
    try {
        const allKeywords = await SocialPost.distinct("keyword");
        res.json({
            success: true,
            count: allKeywords.length,
            keywords: allKeywords
        });
    }catch(err){
        console.error("Error fetching keywords:", err);
        res
          .status(500)
          .json({ success: false, message: "Server error", error: err.message });
    }
}
