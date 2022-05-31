FROM node:10.9.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN apk add imagemagick
COPY index.js ./
COPY src ./src
COPY uploads ./
CMD [ "node", "index"]
