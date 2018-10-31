const Koa = require("koa");
const path = require("path");
const serve = require("koa-static-serve");
const Router = require("koa-router");
const mount = require("koa-mounting");
const koaLog = require("koa-log");

const config = require("./config");
const bookService = require("./service/book");

const port = 8080;

const app = new Koa();
const router = new Router();
const staticPath = path.join(__dirname, "./web/dist");

app.use(async (ctx, next) => {
  const nocache = "no-cache, max-age=0";
  ctx.setCache = age => {
    let cache = nocache;
    if (age) {
      cache = `public, max-age=${age}`;
    }
    ctx.set("Cache-Control", cache);
  };
  ctx.setCache(0);
  try {
    await next();
  } catch (err) {
    // 如果出错，重置cache control
    ctx.setCache(0);
    const { code, message } = err;
    const status = err.status || err.statusCode || 500;
    ctx.status = status;
    ctx.body = {
      message,
      code
    };
  }
});

app.use(koaLog(`:method :url :status :length :response-time ms ":referrer"`));

app.use(
  mount(
    "/static",
    serve(staticPath, {
      maxAge: 365 * 24 * 3600,
      sMaxAge: 600,
      dotfiles: "allow",
      denyQuerystring: true,
      etag: false,
      lastModified: false,
      extname: [".html"]
    })
  )
);

router.get("/", bookService.homeView);
router.get("/detail/:id", bookService.detaiView);
router.get("/ping", ctx => (ctx.body = "pong"));

app.use(router.routes()).use(router.allowedMethods());

console.info(`the server will listen on:${port}`);
app.listen(port);
