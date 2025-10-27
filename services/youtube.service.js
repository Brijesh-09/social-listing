import { getYouTubeSearchResults } from "../integrations/youtubeAPI.js";
import { SocialPost } from "../models/data.js";

export const fetchYouTubeSearch = async (keyword, options = {}) => {
  const results = await getYouTubeSearchResults({ keyword, ...options });
  if (!results?.length) return [];

  const docs = results.map((video) => ({
    keyword,
    platform: "youtube",
    createdAt: new Date(video.publishedAt || Date.now()),
    author: { name: video.channelTitle },
    content: {
      text: video.title,
      description: video.description,
      mediaUrl: video.thumbnails?.high?.url || null,
    },
    metrics: {
      likes: Number(video.likeCount || 0),
      comments: Number(video.commentCount || 0),
      views: Number(video.viewCount || 0),
    },
    sourceUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
  }));

  try {
    await SocialPost.insertMany(docs, { ordered: false });
  } catch (err) {
    console.warn("⚠️ Some YouTube docs may have failed to insert:", err.message);
  }

  return docs;
};
