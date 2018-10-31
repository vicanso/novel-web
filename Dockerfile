FROM node:alpine

ADD ./ /novel-web

RUN cd /novel-web/web \
  && yarn \
  && yarn build \
  && rm -rf node_modules \
  && cd .. \
  && yarn install --production \
  && yarn cache clean \
  && yarn autoclean --force

CMD ["node", "/novel-web/app"]
