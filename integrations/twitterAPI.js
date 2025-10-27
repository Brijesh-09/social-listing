import axios from "axios";

export const getTwitterSearchResults = async ({
  keyword,
  includeKeywords = [],
  excludeKeywords = [],
  startDate,
  endDate,
  maxResults = 10,
}) => {
  const baseUrl = "https://api.twitter.com/2/tweets/search/recent";
  //incomplete content list
  //const url = `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(keyword)}&max_results=50&tweet.fields=created_at,public_metrics,entities,referenced_tweets,text&expansions=author_id&user.fields=username`;


  // Build query
  let query = keyword;
  if (includeKeywords.length) query += " " + includeKeywords.join(" ");
  if (excludeKeywords.length) query += " " + excludeKeywords.map((k) => `-${k}`).join(" ");

  // Params for Axios (no sort_order)
  const params = {
    query,
    max_results: Math.min(Math.max(maxResults, 10), 100), // must be 10-100
    "tweet.fields": "created_at,public_metrics,author_id,text",
  };

  if (startDate) params.start_time = new Date(startDate).toISOString();
  if (endDate) params.end_time = new Date(endDate).toISOString();

  try {
    const { data } = await axios.get(baseUrl, {
      headers: {
        Authorization: `Bearer ${process.env.X_API_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      params,
    });

    if (!data.data) return [];

    return data.data.map((tweet) => ({
      tweetId: tweet.id,
      text: tweet.text,
      authorId: tweet.author_id,
      createdAt: tweet.created_at,
      retweetCount: tweet.public_metrics?.retweet_count,
      replyCount: tweet.public_metrics?.reply_count,
      likeCount: tweet.public_metrics?.like_count,
      quoteCount: tweet.public_metrics?.quote_count,
      tweetUrl: `https://twitter.com/i/web/status/${tweet.id}`,
    }));
  } catch (error) {
    console.error("Twitter API error:", error.response?.data || error.message);
    return [];
  }
};
