module.exports = {
  devServer: {
    proxy: {
      "/@nv": {
        target: "https://papanovel.com",
        changeOrigin: true
      }
    }
  },
  baseUrl: process.env.NODE_ENV === "production" ? "/static/" : "/"
};
