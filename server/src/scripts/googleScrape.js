import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
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

async function scrapeSearchedArticles(info) {
  try {
    const scrapedData = await doGoogleSearch(info.title);
    console.log(`[${info.title}] Found ${scrapedData.length} Google results`);
    
    if (!scrapedData || scrapedData.length === 0) {
      throw new ApiError(404, "No Google search results found");
    }

    const scrapedArticleData = [];
    const failedUrls = [];
    const TARGET_COUNT = 2;
    
    for(const it of scrapedData) {
      if(scrapedArticleData.length >= TARGET_COUNT) {
        break;
      }
      
      try {
        if(scrapedArticleData.length > 0 || failedUrls.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        const url = it.url;
        const { data } = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
          httpsAgent: new (await import('https')).Agent({
            rejectUnauthorized: false
          })
        });

        const doc = new JSDOM(data, { url });
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        if (article && article.textContent) {
          scrapedArticleData.push({
            beyondChat_article_id: info._id,
            sourceUrl: url,
            title: article.title || it.title,
            contentText: article.textContent,
            contentHtml: article.content,
            length: article.length || 0,
            excerpt: article.excerpt || it.snippet,
          });
          console.log(`[${info.title}] Scraped: ${url}`);
        } else {
          console.warn(`[${info.title}] No content from: ${url}`);
          failedUrls.push(it);
        }
      } catch (error) {
        console.error(`[${info.title}] Error scraping ${it.url}:`, error.message);
        failedUrls.push(it);
      }
    }
    
    // Retry pass: if we still don't have 2, retry failed URLs once
    if(scrapedArticleData.length < TARGET_COUNT && failedUrls.length > 0) {
      console.log(`[${info.title}] Retrying ${failedUrls.length} failed URLs...`);
      
      for(const it of failedUrls) {
        if(scrapedArticleData.length >= TARGET_COUNT) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const url = it.url;
          const { data } = await axios.get(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 15000,
            httpsAgent: new (await import('https')).Agent({
              rejectUnauthorized: false
            })
          });

          const doc = new JSDOM(data, { url });
          const reader = new Readability(doc.window.document);
          const article = reader.parse();

          if (article && article.textContent) {
            scrapedArticleData.push({
              beyondChat_article_id: info._id,
              sourceUrl: url,
              title: article.title || it.title,
              contentText: article.textContent,
              contentHtml: article.content,
              length: article.length || 0,
              excerpt: article.excerpt || it.snippet,
            });
            console.log(`[${info.title}] Retry success: ${url}`);
          } else {
            console.warn(`[${info.title}] Retry failed (no content): ${url}`);
          }
        } catch (error) {
          console.error(`[${info.title}] Retry failed: ${it.url} - ${error.message}`);
        }
      }
    }
    
    console.log(`[${info.title}] Final: ${scrapedArticleData.length}/${TARGET_COUNT} articles scraped`);
    
    if (scrapedArticleData.length === 0) {
      throw new ApiError(500, "Failed to scrape any articles from Google results");
    }
    
    return scrapedArticleData;
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Scraping failed"
    );
  }
}

export {scrapeSearchedArticles}