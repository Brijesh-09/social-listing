import { getTwitterSearchResults } from "../integrations/twitterAPI.js";
import { SocialPost } from "../models/data.js";

export const fetchTwitterSearch = async (
  keyword,
  { include = [], exclude = [], language = "en", startDate, endDate } = {}
) => {
  // Build query string
  let query = keyword;
  if (include.length) query += " " + include.join(" ");
  if (exclude.length) query += " -" + exclude.join(" -");
  if (language) query += ` lang:${language}`;

  const results = await getTwitterSearchResults({
    keyword: query,
    startDate,
    endDate,
  });

  if (!results?.length) return [];

  const docs = results.map((tweet) => ({
    keyword,
    platform: "twitter",
    createdAt: new Date(tweet.createdAt),
    author: { id: tweet.authorId },
    content: { text: tweet.text },
    metrics: {
      likes: tweet.likeCount || 0,
      comments: tweet.replyCount || 0,
      shares: tweet.retweetCount || 0,
    },
    sourceUrl: tweet.tweetUrl,
  }));

  try {
    await SocialPost.insertMany(docs, { ordered: false });
  } catch (err) {
    console.warn("⚠️ Twitter insert warning:", err.message);
  }

  return docs;
};
