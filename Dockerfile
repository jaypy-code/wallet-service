FROM node:latest

WORKDIR /app

COPY package.json package.json
RUN npm i

COPY . .

EXPOSE 3000

CMD [ "npm", "start"]
