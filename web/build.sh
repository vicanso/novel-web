yarn build-app \
  && cd ../../novel-app/www \
  && rm -rf ./* \
  && cp -r ../../novel-web/web/dist/* . 