let baseUrl = process.env.NODE_ENV === "production" ? "./static/" : "/";

if (process.env.BASE_URL) {
  baseUrl = process.env.BASE_URL;
}

module.exports = {
  devServer: {
    proxy: {
      "/@nv": {
        target: "https://papanovel.com",
        changeOrigin: true
      }
    }
  },
  baseUrl
};
