const dev = "development";
export const app = "novel";

// eslint-disable-next-line
export const env = window.CONFIG.env || dev;

export const urlPrefix = window.CONFIG.urlPrefix || "/@nv";

export const target = window.CONFIG.target || "web";

// default timeout
export const timeout = 15 * 1000;

export const tinyUrlPrefix =
  window.CONFIG.tinyUrlPrefix || "https://tiny.aslant.site/api/images/v1";
