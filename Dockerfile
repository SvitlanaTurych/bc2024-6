FROM node
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
CMD ["npx", "nodemon", "index.js", "--host", "0.0.0.0", "--port", "8080", "--cache", "notes"]