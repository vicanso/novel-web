const fs = require("fs");
const path = require("path");

const indexFile = path.join(__dirname, "../dist/index.html");
let html = fs.readFileSync(indexFile, "utf8");

const config = `
        window.CONFIG = {
          "target": "app",
          "env": "production",
          "urlPrefix": "https://aslant.site/@nv",
          "tinyUrlPrefix": "https://tiny.aslant.site/api/images/v1"
        };
`;
html = html.replace(/\/\/ CONFIG START([\s\S]+)\/\/ CONFIG END/, config);
html = html.replace(
  "<script></script>",
  '<script type="text/javascript" src="cordova.js"></script>'
);
fs.writeFileSync(indexFile, html);
