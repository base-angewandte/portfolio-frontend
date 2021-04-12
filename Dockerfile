FROM node:14-alpine

ENV HOST 0.0.0.0

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm i npm@7 -g && npm i

COPY . .

CMD ["npm", "run", "build"]
