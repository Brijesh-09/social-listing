// controllers/search.brand.controller.js
import { Brand } from "../models/brand.js";
import { SocialPost } from "../models/data.js";
import { fetchYouTubeSearch } from "../services/youtube.service.js";
import { fetchTwitterSearch } from "../services/twitter.service.js";
import { fetchRedditSearch } from "../services/reddit.service.js";

export const runSearchForBrand = async (req, res) => {
  try {
    const { brandName } = req.body;

    if (!brandName)
      return res.status(400).json({ success: false, message: "brandName is required" });

    const brand = await Brand.findOne({ brandName });
    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });

    const {
      keywords,
      includeKeywords = [],
      excludeKeywords = [],
      platforms,
      language,
      country,
    } = brand;

    if (!keywords.length)
      return res.status(400).json({ success: false, message: "No keywords configured for this brand" });
    if (!platforms.length)
      return res.status(400).json({ success: false, message: "No platforms configured for this brand" });

    const now = new Date();
    const startDate = new Date(now.getTime() - 60 * 60 * 1000); // last 1 hour
    const endDate = new Date(now.getTime() - 10 * 1000);

    const results = {};
    const saveOps = [];

    // Loop over all platforms
    for (const platform of platforms) {
      results[platform] = [];

      for (const keyword of keywords) {
        let fetchedData = [];

        if (platform === "youtube") {
          fetchedData = await fetchYouTubeSearch(keyword, {
            includeKeywords,
            excludeKeywords,
            language,
            country,
            startDate,
            endDate,
          });
        } else if (platform === "twitter") {
          fetchedData = await fetchTwitterSearch(keyword, {
            includeKeywords,
            excludeKeywords,
            language,
            country,
            startDate,
            endDate,
          });
        } else if (platform === "reddit") {
          fetchedData = await fetchRedditSearch(keyword, {
            includeKeywords,
            excludeKeywords,
            startDate,
            endDate,
          });
        }

        results[platform].push(...fetchedData);

        // Prepare for DB save
        if (fetchedData.length) {
          const docs = fetchedData.map((item) => ({
            ...item,
            brandName: brand.brandName,
            keyword,
            platform,
            createdAt: new Date(item.publishedAt || Date.now()),
          }));
          saveOps.push(SocialPost.insertMany(docs, { ordered: false }));
        }
      }
    }

    await Promise.all(saveOps);

    res.json({
      success: true,
      brandName: brand.brandName,
      summary: {
        youtube: results.youtube?.length || 0,
        twitter: results.twitter?.length || 0,
        reddit: results.reddit?.length || 0,
      },
    });
  } catch (err) {
    console.error("Brand Search Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// search.controller.js


export const runSearch = async (req, res) => {
  try {
    const { brandName } = req.body;

    const brand = await Brand.findOne({ brandName });
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const allResults = [];

    for (const keyword of brand.keywords) {
      /** ─────────────── YouTube ─────────────── **/
      if (brand.platforms.includes("youtube")) {
        const ytData = await fetchYouTubeSearch(keyword, {
          includeKeywords: brand.includeKeywords,
          excludeKeywords: brand.excludeKeywords,
          language: brand.language,
          country: brand.country,
        });

        const ytPosts = ytData.map((p) => ({
          brand: brand._id,
          keyword,
          platform: "youtube",
          createdAt: new Date(p.createdAt || Date.now()),
          author: p.author,
          content: p.content,
          metrics: p.metrics,
          sourceUrl: p.sourceUrl,
          fetchedAt: new Date(),
        }));

        allResults.push(...ytPosts);
      }

      /** ─────────────── Twitter ─────────────── **/
      if (brand.platforms.includes("twitter")) {
        const twData = await fetchTwitterSearch(keyword, {
          includeKeywords: brand.includeKeywords,
          excludeKeywords: brand.excludeKeywords,
        });

        const twPosts = twData.map((p) => ({
          brand: brand._id,
          keyword,
          platform: "twitter",
          createdAt: new Date(p.createdAt || Date.now()),
          author: p.author,
          content: p.content,
          metrics: p.metrics,
          sourceUrl: p.sourceUrl,
          fetchedAt: new Date(),
        }));

        allResults.push(...twPosts);
      }

      /** ─────────────── Reddit ─────────────── **/
      if (brand.platforms.includes("reddit")) {
        const rdData = await fetchRedditSearch(keyword, {
          includeKeywords: brand.includeKeywords,
          excludeKeywords: brand.excludeKeywords,
          language: brand.language,
          country: brand.country,
        });

        const rdPosts = rdData.map((p) => ({
          brand: brand._id,
          keyword,
          platform: "reddit",
          createdAt: new Date(p.createdAt || Date.now()),
          author: p.author,
          content: p.content,
          metrics: p.metrics,
          sourceUrl: p.sourceUrl,
          fetchedAt: new Date(),
        }));

        allResults.push(...rdPosts);
      }
    }

    if (allResults.length) {
      await SocialPost.insertMany(allResults, { ordered: false });
    }

    res.json({
      success: true,
      message: `Fetched and saved ${allResults.length} posts.`,
    });
  } catch (err) {
    console.error("Search Run Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

