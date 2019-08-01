FROM node:current-alpine AS base
WORKDIR /app
COPY . .
RUN yarn install --production
ENTRYPOINT [ "/bin/sh" ]
CMD [ "hexo" ]

FROM base AS build
RUN yarn run build

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/public .
EXPOSE 80/tcp
