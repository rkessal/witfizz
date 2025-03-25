FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5002
EXPOSE 5080

CMD ["npm", "run", "dev"] 