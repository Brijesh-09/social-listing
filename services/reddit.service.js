import { getRedditSearchResults } from "../integrations/redditAPI.js";
import { SocialPost } from "../models/data.js";

export const fetchRedditSearch = async (keyword, options = {}) => {
  const results = await getRedditSearchResults({ keyword, ...options });
  if (!results?.length) return [];

  const docs = results.map((post) => ({
    keyword,
    platform: "reddit",
    createdAt: new Date(post.createdAt),
    author: { name: post.author },
    content: { text: post.title },
    metrics: {
      likes: post.score || 0,
      comments: post.numComments || 0,
    },
    sourceUrl: post.permalink,
  }));

  try {
    await SocialPost.insertMany(docs, { ordered: false });
  } catch (err) {
    console.warn("⚠️ Some Reddit docs may have failed to insert:", err.message);
  }

  return docs;
};
