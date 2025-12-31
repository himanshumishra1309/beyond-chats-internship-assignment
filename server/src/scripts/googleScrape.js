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

async function scrapeSearchedArticles(info) {
  try {
    const scrapedData = await doGoogleSearch(info.title);
    console.log("scrapeSearchedArticles: ", scrapedData);
    
    if (!scrapedData || scrapedData.length === 0) {
      throw new ApiError(404, "No Google search results found");
    }

    const scrapedArticleData = [];
    
    for(const it of scrapedData) {
      try {
        if(scrapedArticleData.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        const url = it.url;
        const { data } = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
          httpsAgent: new (await import('https')).Agent({
            rejectUnauthorized: false  // Bypass SSL verification
          })
        });

        {/*
        
          Error that occured:
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="utf-8">
              <title>Error</title>
          </head>
          <body>
              <pre>Error: unable to verify the first certificate<br> 
              &nbsp; &nbsp;at scrapeSearchedArticles 
              (file:///D:/Himanshu%20Mishra/beyondChatProject/server/src/scripts/googleScrape.js:86:11)
              // <br> &nbsp; &nbsp;at process.processTicksAndRejections 
              // (node:internal/process/task_queues:105:5)<br> &nbsp; 
              // &nbsp;at async 
              // file:///D:/Himanshu%20Mishra/beyondChatProject/server/src/controller/scraper.controller.js:91:30</pre>
          </body>
          </html>

          solution:
          httpsAgent: new (await import('https')).Agent({
            rejectUnauthorized: false  // Bypass SSL verification
          })
          
        */}

        const doc = new JSDOM(data, { url });
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        if (article && article.textContent) {
          scrapedArticleData.push({
            article_id: info._id,
            sourceUrl: url,
            title: article.title || it.title,
            contentText: article.textContent,
            contentHtml: article.content,
            length: article.length || 0,
            excerpt: article.excerpt || it.snippet,
          });
        } else {
          console.warn(`Failed to extract content from: ${url}`);
        }
      } catch (error) {
        console.error(`Error scraping ${it.url}:`, error.message);
        // Continue with next article instead of failing completely
      }
    }
    
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