import axios from "axios";

export const getYouTubeSearchResults = async (query, dateRange = "recent") => {
  const API_KEY = process.env.YT_API_KEY;

  let publishedAfter = "";
  if (dateRange === "24h") {
    publishedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  }

  // Include publishedAfter in API if set
  let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
    query
  )}&key=${API_KEY}`;

  if (publishedAfter) {
    searchUrl += `&publishedAfter=${publishedAfter}`;
  }

  const { data: searchData } = await axios.get(searchUrl);

  // Extract video IDs
  const videoIds = searchData.items.map((item) => item.id.videoId).join(",");
  if (!videoIds) return [];

  // Get video statistics
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
  const { data: statsData } = await axios.get(statsUrl);

  // Combine snippet + statistics
  const results = statsData.items.map((item) => ({
    videoId: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnails: item.snippet.thumbnails,
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    commentCount: item.statistics.commentCount,
  }));

  return results;
};

