FROM node:carbon-alpine

ENV HOST 0.0.0.0

WORKDIR /app

COPY . .
RUN npm i npm@latest -g && npm i



CMD ["npm", "run", "build"]
