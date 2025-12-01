FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","index.js"]