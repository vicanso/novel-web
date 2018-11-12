import request from "axios";

import { urlPrefix, timeout } from "@/config";
import logger from "@/helpers/logger";

request.interceptors.request.use(config => {
  if (!config.timeout) {
    config.timeout = timeout;
  }
  config.url = `${urlPrefix}${config.url}`;
  logger.info(`${config.method} ${config.url}`, config.params);
  return config;
});
