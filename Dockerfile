FROM node:carbon-alpine

ENV HOST 0.0.0.0

WORKDIR /app

COPY package*.json ./
RUN npm i npm@latest -g && npm i

COPY . .
RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
