import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getBlogData } from "../scripts/beyondChatScrape";
import { Article } from "../model/article.model";
import { scrapeSearchedArticles } from "../scripts/googleScrape";
import { GoogleScrapedArticle } from "../model/googleScrapedArticle.model";

const scrapeBeyondChatsArticles = asyncHandler(async (req, res) => {
  const scrapedData = await getBlogData();

  if (!scrapedData) {
    throw new ApiError(400, "Unable to scrape data from beyondChats");
  }

  const scrapedSlugs = scrapedData.map((article) => article.slug);

  const updatePromises = scrapedData.map((article) =>
    Article.findOneAndUpdate(
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

  const deleteArticles = await Article.deleteMany({
    slug: { $nin: scrapedSlugs },
  });


  throw new ApiResponse(
    200,
    {
      articles: updatedArticles,
      stats: {
        total: updatedArticles.length,
        deleted: deleteArticles.deletedCount,
      },
    },
    `Successfully synced ${updatedArticles.length} articles. Removed ${deleteArticles.deletedCount} outdated articles.`
  );
});

const scrapeGoogleArticles = asyncHandler(async (req, res) => {
    const beyondChatsArticles = await Article.find();

    if(!beyondChatsArticles){
        throw new ApiError(500, "Error fetching articles of beyond chats");
    }

    const beyondChatsArticlesId = beyondChatsArticles.map(article => article._id);

    const beyondChatsArticlesInfo = beyondChatsArticles.map(article => ({
        _id: article._id,
        title: article.title
    }));

    const googleScrapedData = [];

    for(const it of beyondChatsArticlesInfo){
        const dataReceived = await scrapeSearchedArticles(it);
        googleScrapedData.push(dataReceived);
    }

    const updatePromises = googleScrapedData.map((blog) => 
        GoogleScrapedArticle.findOneAndUpdate(
            {article_id: blog.article_id},
            {
                $set: {
                    article_id: blog.article_id,
                    sourceUrl: url,
                    title: blog.title,
                    contentText: blog.textContent,
                    contentHtml: blog.content,
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

    const deleteArticles = await GoogleScrapedArticle.deleteMany({
        article_id: {$nin: beyondChatsArticlesId}
    });

    throw new ApiResponse(
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
});

const completeScrape = asyncHandler(async (req, res) => {

})

export {scrapeBeyondChatsArticles, scrapeGoogleArticles}