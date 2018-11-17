import request from "axios";

import { urlPrefix, timeout } from "@/config";
import logger from "@/helpers/logger";

request.interceptors.request.use(config => {
  if (!config.timeout) {
    config.timeout = timeout;
  }
  config.startedAt = Date.now();
  config.url = `${urlPrefix}${config.url}`;
  const msg = `>> ${config.method} ${config.url}`;
  if (config.params) {
    logger.info(msg, config.params);
  } else {
    logger.info(msg);
  }
  return config;
});

request.interceptors.response.use(
  function(response) {
    const { config, status } = response;
    const msg = `<< ${config.method} ${config.url} use ${Date.now() -
      config.startedAt}ms ${status}`;
    logger.info(msg);
    return response;
  },
  function(error) {
    const { config } = error;
    const msg = `${config.method} ${config.url} use ${Date.now() -
      config.startedAt}ms ${error.code} ${error.message}`;
    logger.error(msg);
    return Promise.reject(error);
  }
);
