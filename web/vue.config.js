let baseUrl = process.env.NODE_ENV === "production" ? "./static/" : "/";

if (process.env.BASE_URL) {
  baseUrl = process.env.BASE_URL;
}

module.exports = {
  devServer: {
    proxy: {
      "/@nv": {
        target: "https://xs.aslant.site",
        changeOrigin: true
      }
    }
  },
  baseUrl
};
