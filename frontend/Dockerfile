FROM node:22

WORKDIR /app

COPY package*.json ./
RUN rm -rf node_modules package-lock.json
RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]