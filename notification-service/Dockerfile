FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

ENV NODE_ENV=production

COPY . .

EXPOSE 3003

CMD ["node", "index.js"]
