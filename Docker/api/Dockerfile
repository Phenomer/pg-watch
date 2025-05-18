FROM node:24 AS builder

COPY ./api/package.json ./api/package-lock.json /opt/db-watch/
WORKDIR /opt/db-watch
RUN npm install

COPY \
    ./api/package-lock.json \
    ./api/package.json \
    ./api/tsconfig.json \
    ./api/eslint.config.js \
    ./api/src \
    /opt/db-watch/
RUN npm run build

CMD ["npm", "run", "start"]
