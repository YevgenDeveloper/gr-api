FROM node:10.9.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY *.js ./
COPY uploads ./
ADD ./layouts ./layouts
CMD [ "node", "index"]
