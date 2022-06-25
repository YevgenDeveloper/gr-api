FROM node:10.9.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN apk add gimp
COPY index.js ./
COPY src ./src
COPY uploads ./
COPY submodules/layouts/GIMP/* /root/.gimp-2.8/scripts
CMD [ "node", "index"]
