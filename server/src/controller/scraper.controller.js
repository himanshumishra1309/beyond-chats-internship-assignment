import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getBlogData } from "../scripts/beyondChatScrape.js";
import { Article } from "../model/article.model.js";
import { scrapeSearchedArticles } from "../scripts/googleScrape.js";
import { GoogleScrapedArticle } from "../model/googleScrapedArticle.model.js";
import { BeyondChatsBlog } from "../model/beyondChatsBlog.model.js";
import { generatedUpdatedArticle } from "../scripts/llmResult.js";

const scrapeBeyondChatsArticles = asyncHandler(async (req, res) => {
  console.log("scrapeBeyondChatsArticles called");
  const scrapedData = await getBlogData();

  if (!scrapedData) {
    throw new ApiError(400, "Unable to scrape data from beyondChats");
  }

  const scrapedSlugs = scrapedData.map((article) => article.slug);

  const updatePromises = scrapedData.map((article) =>
    BeyondChatsBlog.findOneAndUpdate(
      { slug: article.slug },
      {
        $set: {
          title: article.title,
          slug: article.slug,
          blogUrl: article.blogUrl,
          imageUrl: article.imageUrl,
          author: article.author,
          publishedDate: article.publishedDate,
          excerpt: article.excerpt,
          contentText: article.contentText,
          contentHtml: article.contentHtml,
          contentImages: article.contentImages,
          tags: article.tags,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    )
  );

  const updatedArticles = await Promise.all(updatePromises);

  if (!updatedArticles) {
    throw new ApiError(400, "Error updating scraped data");
  }

  const deleteArticles = await BeyondChatsBlog.deleteMany({
    slug: { $nin: scrapedSlugs },
  });

  console.log("scrapeBeyondChatsArticles completed");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articles: updatedArticles,
        stats: {
          total: updatedArticles.length,
          deleted: deleteArticles.deletedCount,
        },
      },
      `Successfully synced ${updatedArticles.length} articles. Removed ${deleteArticles.deletedCount} outdated articles.`
    )
  );
});

const scrapeGoogleArticles = asyncHandler(async (req, res) => {
  console.log("scrapeGoogleArticles called");
  const beyondChatsArticles = await BeyondChatsBlog.find();

  if (!beyondChatsArticles || beyondChatsArticles.length === 0) {
    throw new ApiError(404, "No articles of beyond chats found");
  }

  const beyondChatsArticlesInfo = beyondChatsArticles.map((article) => ({
    _id: article._id,
    title: article.title,
  }));

  const googleScrapedData = [];
  let updatedCount = 0;
  let deletedCount = 0;

  for (const it of beyondChatsArticlesInfo) {
    const dataReceived = await scrapeSearchedArticles(it);
    const dataReceivedUrl = dataReceived.map((article) => article.sourceUrl);
    const updatePromises = dataReceived.map((blog) =>
      GoogleScrapedArticle.findOneAndUpdate(
        { beyondChat_article_id: blog.beyondChat_article_id, sourceUrl: blog.sourceUrl },
        {
          $set: {
            beyondChat_article_id: blog.beyondChat_article_id,
            sourceUrl: blog.sourceUrl,
            title: blog.title,
            contentText: blog.contentText,
            contentHtml: blog.contentHtml,
            length: blog.length,
            excerpt: blog.excerpt,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      )
    );

    const updatedArticles = await Promise.all(updatePromises);

    if (!updatedArticles) {
      throw new ApiError(500, "Error uploading google scraped articles");
    }

    googleScrapedData.push(...updatedArticles);
    updatedCount += updatedArticles.length;

    const deleteArticles = await GoogleScrapedArticle.deleteMany({
      beyondChat_article_id: it._id,
      sourceUrl: { $nin: dataReceivedUrl },
    });
    deletedCount += deleteArticles.deletedCount;
  }

  console.log("scrapeGoogleArticles completed");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articles: googleScrapedData,
        stats: {
          total: updatedCount,
          deleted: deletedCount,
        },
      },
      `Successfully synced ${updatedCount} articles. Removed ${deletedCount} outdated articles.`
    )
  );
});

const setLLMResponseForArticles = asyncHandler(async (req, res) => {
  console.log("setLLMResponseForArticles called");
  
  const originalArticles = await BeyondChatsBlog.find();
  
  if (!originalArticles || originalArticles.length === 0) {
    throw new ApiError(404, "No BeyondChats articles found");
  }

  const referenceArticles = await GoogleScrapedArticle.find();
  
  if (!referenceArticles || referenceArticles.length === 0) {
    throw new ApiError(404, "No Google reference articles found. Run Google scraper first.");
  }

  const processedArticles = [];
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (const article of originalArticles) {
    try {
      console.log(`Processing article: ${article.title}`);
      
      const articleReferences = referenceArticles.filter(
        (blog) => blog.beyondChat_article_id.toString() === article._id.toString()
      );
      
      if (articleReferences.length === 0) {
        console.warn(`No references found for article: ${article.title}`);
        errors.push({ articleId: article._id, title: article.title, error: "No references found" });
        failCount++;
        continue;
      }

      const referenceIds = articleReferences.map((blog) => blog._id);

      console.log(`Calling LLM for: ${article.title} with ${articleReferences.length} references`);
      const llmResponse = await generatedUpdatedArticle(article, articleReferences);

      const updatedData = await Article.findOneAndUpdate(
        { originalArticleId: article._id },
        {
          $set: {
            originalArticleId: article._id,
            referenceArticleIds: referenceIds,
            title: article.title,
            slug: article.slug,
            blogUrl: article.blogUrl,
            imageUrl: article.imageUrl,
            author: article.author,
            publishedDate: article.publishedDate,
            excerpt: article.excerpt,
            contentText: llmResponse.contentText,
            contentHtml: llmResponse.contentHtml,
            contentImages: article.contentImages,
            tags: article.tags,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      if (!updatedData) {
        throw new Error("Database update returned null");
      }

      processedArticles.push(updatedData);
      successCount++;
      console.log(`Successfully processed: ${article.title}`);
      
    } catch (error) {
      console.error(`Failed to process article ${article.title}:`, error.message);
      errors.push({ 
        articleId: article._id, 
        title: article.title, 
        error: error.message 
      });
      failCount++;
    }
  }

  console.log(`Total: ${originalArticles.length}, Success: ${successCount}, Failed: ${failCount}`);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articles: processedArticles,
        stats: {
          total: originalArticles.length,
          success: successCount,
          failed: failCount,
        },
        errors: errors.length > 0 ? errors : undefined
      },
      `Successfully processed ${successCount}/${originalArticles.length} articles with LLM.${failCount > 0 ? ` ${failCount} failed.` : ''}`
    )
  );
});

export {
  scrapeBeyondChatsArticles,
  scrapeGoogleArticles,
  setLLMResponseForArticles,
};
