FROM node:carbon-alpine

ENV HOST 0.0.0.0

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm i npm@latest-6 -g && npm i

COPY . .

CMD ["npm", "run", "build"]
