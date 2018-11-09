const fs = require("fs");
const path = require("path");

const indexFile = path.join(__dirname, "../dist/index.html");
const html = fs.readFileSync(indexFile, "utf8");

const config = `
        window.CONFIG = {
          "env": "production",
          "urlPrefix": "https://papanovel.com/@nv",
          "coverUrlPrefix": "https://tiny.papanovel.com/api/images/v1"
        };
`;
const newHtml = html.replace(
  /\/\/ CONFIG START([\s\S]+)\/\/ CONFIG END/,
  config
);
fs.writeFileSync(indexFile, newHtml);
