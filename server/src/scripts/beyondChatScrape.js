import axios from "axios";
import { Cheerio } from "cheerio";

async function getMaxPageNumbers() {
  const { data } = await axios.get("https://beyondchats.com/blogs/");
  const $ = Cheerio.load(data);

  const pages = [];

  $(".page-numbers").each((_, el) => {
    const page = parseInt($(el).text());
    if (!isNaN(page)) pages.push(page);
  });

  return Math.max(...pages);
}

async function getFiveBlogs() {
  const lastPage = await getMaxPageNumbers();
  let page = lastPage;
  const blogs = [];

  while (blogs.length < 5 && page > 0) {
    const url = `https://beyondchats.com/blogs/page/${page}/`;
    const { data } = await axios.get(url);
    const $ = Cheerio.load(data);

    $("article").each((_, el) => {
      if (blogs.length < 5) {
        const textTitle = $(el).find("h2.entry-title a");
        const title = textTitle.text().trim();
        const blogUrl = textTitle.attr("href");
        const imageUrl = $(el).find("a.ct-media-container img").attr("src");
        const author = $(el).find("li.meta-author span").text().trim();
        const publishedDate = $(el).find("li.meta-date time").attr("datetime");
        const entryExcerpt = $(el).find("div.entry-excerpt p").text().trim();
        const tags = $(el).find("li.meta-categories a")
                .map((_, tag) => $(tag).text().trim()).get();

        blogs.push({
            title,
            blogUrl,
            imageUrl,
            author,
            publishedDate,
            entryExcerpt,
            tags
        });
      }
    });

    page--;
  }
}
