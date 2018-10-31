const axios = require("axios");
const _ = require("lodash");
const path = require("path");
const pug = require("pug");
const util = require("util");
const fs = require("fs");

const request = axios.create();

const readFile = util.promisify(fs.readFile);
const config = require("../config");
const todayHotCategory = "今日必读";
const viewPath = path.join(__dirname, "../view");
const staticPath = path.join(__dirname, "../web/dist");

const defaultQuery = {
  offset: 0,
  limit: 5,
  field: ["id", "name", "author", "brief", "category", "updatedAt"].join(","),
  order: "-updatedAt"
};

request.interceptors.request.use(function(config) {
  config.headers.Host = "papa.aslant.site";
  return config;
});

function getUrl(key) {
  return config.getConfig("api.host") + config.getConfig(`api.${key}`);
}

function getBooks(query) {
  const url = getUrl("books");
  return request.get(url, {
    params: _.extend({}, defaultQuery, query)
  });
}

function renderBooks(data) {
  const file = path.join(viewPath, "books.pug");
  return pug.renderFile(file, data);
}

async function getTodayRecommend() {
  const res = await getBooks({
    category: todayHotCategory
  });
  const { books } = res.data;
  return renderBooks({
    books,
    title: todayHotCategory
  });
}

async function getPopu() {
  const res = await getBooks({
    corder: "latestViewCount"
  });
  const { books } = res.data;
  return renderBooks({
    books,
    title: "最新热门"
  });
}

async function fillHtml(data) {
  const file = path.join(staticPath, "index.html");
  let html = await readFile(file, "utf8");
  html = html.replace("{{FILL_CONTENT}}", data);
  return html.replace(`"development"`, `"${config.getENV()}"`);
}

exports.homeView = async ctx => {
  const htmls = [];
  try {
    const todayRecommend = await getTodayRecommend();
    htmls.push(todayRecommend);

    const popu = await getPopu();
    htmls.push(popu);
  } catch (err) {
    // 如果出错，输出日志则可
    console.error(err);
  }
  const html = await fillHtml(htmls.join(""));
  ctx.setCache(60);
  ctx.body = html;
};

exports.detaiView = async ctx => {
  const id = ctx.params.id;
  let url = getUrl("book");
  let res = await request.get(url.replace(":id", id));
  const bookDetail = res.data;

  url = getUrl("recommendBookById");
  res = await request.get(url.replace(":id", id), {
    params: {
      limit: 5,
      offset: 0,
      field: "id,name,author,brief,updatedAt",
      order: "-updatedAt"
    }
  });
  const recommends = res.data.books;

  const file = path.join(viewPath, "book.pug");
  const detail = pug.renderFile(
    file,
    _.extend(
      {
        recommends
      },
      bookDetail
    )
  );
  const html = await fillHtml(detail);
  ctx.setCache(60);
  ctx.body = html;
};
