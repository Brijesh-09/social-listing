import { getTwitterSearchResults } from "../integrations/twitterAPI.js";
import { SocialPost } from "../models/data.js";

export const fetchTwitterSearch = async (keyword, options = {}) => {
  const results = await getTwitterSearchResults({ keyword, ...options });
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
    console.warn("⚠️ Some Twitter docs may have failed to insert:", err.message);
  }

  return docs;
};
