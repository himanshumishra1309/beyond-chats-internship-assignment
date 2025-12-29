import axios from "axios";
import * as cheerio from "cheerio";
import { ApiError } from "../utils/ApiError";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

async function doGoogleSearch(title) {
  try {
    const params = {
      api_key: process.env.SERP_API_KEY,
      engine: "google",
      q: title,
      num: 5,
      gl: "us",
      hl: "en",
    };

    const response = await axios.get("https://serpapi.com/search", {
      params,
      timeout: 10000,
    });

    const results = response.data.organic_results || [];

    return results
      .filter((result) => {
        const url = result.link?.toLowerCase() || "";
        return (
          !url.includes("wikipedia") &&
          !url.includes("youtube") &&
          !url.includes("beyondchats.com") &&
          !url.includes("amazon") &&
          !url.includes("flipkart")
        );
      })
      .slice(0, 2)
      .map((result) => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
      }));
  } catch (error) {
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || error.message
    );
  }
}

async function scrapeSearchedArticles(title) {
  try {
    const scrapedData = await doGoogleSearch(title);

    const scrapedArticleData = await Promise.all(
      scrapedData.map(async (it) => {
        const url = it.url;
        const { data } = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
          timeout: 10000,
        });

        const doc = new JSDOM(data, { url });
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        if (!article) {
          throw new ApiError(404, "Unable to extract article content");
        }

        return {
          sourceUrl: url,
          title: article.title,
          contentText: article.textContent,
          contentHtml: article.content,
          length: article.length,
          excerpt: article.excerpt,
        };
      })
    );
    return scrapedArticleData;
  } catch (error) {
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || error.message || "Scraping failed"
    );
  }
}
