import axios from "axios";
import * as cheerio from "cheerio";
import { ApiError } from "../utils/ApiError";

const blogs = [];

async function getMaxPageNumbers() {
  try {
    const { data } = await axios.get("https://beyondchats.com/blogs/");
    const $ = cheerio.load(data);
  
    const pages = [];
  
    $(".page-numbers").each((_, el) => {
      const page = parseInt($(el).text());
      if (!isNaN(page)) pages.push(page);
    });
  
    return Math.max(...pages);
  } catch (error) {
    throw new ApiError(error.response?.status, error.response?.data?.message);
  }
}

async function getFiveBlogs() {
  try {
    const lastPage = await getMaxPageNumbers();
    let page = lastPage;

    while (blogs.length < 5 && page > 0) {
      const url = `https://beyondchats.com/blogs/page/${page}/`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
  
      $("article").each((_, el) => {
        if (blogs.length < 5) {
          const textTitle = $(el).find("h2.entry-title a");
          const title = textTitle.text().trim();
          const blogUrl = textTitle.attr("href");
          const blogUrlParts = blogUrl.split('/').filter(Boolean);
          const slug = blogUrlParts[blogUrlParts.length - 1];
          const imageUrl = $(el).find("a.ct-media-container img").attr("src");
          const author = $(el).find("li.meta-author span").text().trim();
          const publishedDate = $(el).find("li.meta-date time").attr("datetime");
          const excerpt = $(el).find("div.entry-excerpt p").text().trim();
          const tags = $(el).find("li.meta-categories a")
                  .map((_, tag) => $(tag).text().trim()).get();
  
          blogs.push({
              title,
              slug,
              blogUrl,
              imageUrl,
              author,
              publishedDate,
              excerpt,
              tags
          });
        }
      });
  
      page--;
    }
  } catch (error) {
    throw new ApiError(error.response?.status, error.response?.data?.message);
  }
}

async function getBlogData() {
  try {
    await Promise.all(
      blogs.map(async (el) => {
        const url = el.blogUrl;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        $(".wp-applause-container").remove();
        $(".elementor-share-buttons").remove();
        $(".has-social-placeholder").remove();

        const contentText = $(".elementor-widget-theme-post-content")
          .text()
          .replace(/\s+/g, " ")
          .trim();

        const contentHtml = $(".elementor-widget-theme-post-content").html();

        const contentImages = [];
        $(".elementor-widget-theme-post-content img").each((_, img) => {
          const src = $(img).attr("src");
          if (src) contentImages.push(src);
        });

        el.contentText = contentText;
        el.contentHtml = contentHtml;
        el.contentImages = contentImages;
      })
    );
  } catch (error) {
    throw new ApiError(error.response?.status, error.response?.data?.message);
  }
}
