ARG NODE_VERSION=23.1.0
FROM node:${NODE_VERSION}-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
USER node
COPY . .
EXPOSE 3000
CMD npx nodemon -L --inspect=0.0.0.0:9229 index.js --host 0.0.0.0 -p 3000 -c notes