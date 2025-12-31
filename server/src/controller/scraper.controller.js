import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getBlogData } from "../scripts/beyondChatScrape.js";
import { Article } from "../model/article.model.js";
import { scrapeSearchedArticles } from "../scripts/googleScrape.js";
import { GoogleScrapedArticle } from "../model/googleScrapedArticle.model.js";
import { BeyondChatsBlog } from "../model/beyondChatsBlog.model.js";

const scrapeBeyondChatsArticles = asyncHandler(async (req, res) => {
  console.log("scrapeBeyondChatsArticles called")
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

  console.log("scrapeBeyondChatsArticles completed")


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
    console.log("scrapeGoogleArticles called")
    const beyondChatsArticles = await BeyondChatsBlog.find();

    if(!beyondChatsArticles || beyondChatsArticles.length === 0){
        throw new ApiError(404, "No articles of beyond chats found");
    }

    const beyondChatsArticlesInfo = beyondChatsArticles.map(article => ({
        _id: article._id,
        title: article.title
    }));

    const googleScrapedData = [];
    let updatedCount = 0;
    let deletedCount = 0;

    for(const it of beyondChatsArticlesInfo){
        const dataReceived = await scrapeSearchedArticles(it);
        const dataReceivedUrl = dataReceived.map(article => article.sourceUrl);
        const updatePromises = dataReceived.map((blog) => 
            GoogleScrapedArticle.findOneAndUpdate(
                {article_id: blog.article_id, sourceUrl: blog.sourceUrl},
                {
                    $set: {
                        article_id: blog.article_id,
                        sourceUrl: blog.sourceUrl,
                        title: blog.title,
                        contentText: blog.contentText,
                        contentHtml: blog.contentHtml,
                        length: blog.length,
                        excerpt: blog.excerpt,
                    }
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            )
        );
        
        const updatedArticles = await Promise.all(updatePromises);

        if(!updatedArticles){
            throw new ApiError(500, "Error uploading google scraped articles")
        }

        googleScrapedData.push(...updatedArticles);
        updatedCount+=(updatedArticles.length);
        
        const deleteArticles = await GoogleScrapedArticle.deleteMany({
            article_id: it._id,
            sourceUrl: {$nin: dataReceivedUrl}
        });
        deletedCount+=(deleteArticles.deletedCount);
    }

    console.log("scrapeGoogleArticles completed")

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

const completeScrape = asyncHandler(async (req, res) => {

})

export {scrapeBeyondChatsArticles, scrapeGoogleArticles}