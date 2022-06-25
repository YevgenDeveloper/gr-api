FROM node:10.9.0-alpine
WORKDIR /app
RUN npm install pm2 -g
RUN apk add gimp
EXPOSE 4000
CMD [ "pm2-dev", "index.js"]
