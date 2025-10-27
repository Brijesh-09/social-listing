import { fetchYouTubeSearch } from "../services/youtube.service.js";
import { fetchTwitterSearch } from "../services/twitter.service.js";
import { fetchRedditSearch } from "../services/reddit.service.js";

export const searchKeyword = async (req, res) => {
  try {
    const {
      keyword,
      platforms = ["youtube" , "twitter", "reddit"],
      dateRange = "recent",
      twitterOptions = {},
      youtubeOptions = {},
      redditOptions = {},
      startDate,
      endDate,
    } = req.body;

    const results = {};
    const promises = [];

    if (platforms.includes("youtube"))
      promises.push(fetchYouTubeSearch(keyword, { ...youtubeOptions, dateRange }).then((d) => (results.youtube = d)));

    if (platforms.includes("twitter"))
      promises.push(fetchTwitterSearch(keyword, { ...twitterOptions, startDate, endDate }).then((d) => (results.twitter = d)));

    if (platforms.includes("reddit"))
      promises.push(fetchRedditSearch(keyword, { ...redditOptions, dateRange }).then((d) => (results.reddit = d)));

    await Promise.all(promises);

    res.json({ success: true, keyword, platforms, results });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
