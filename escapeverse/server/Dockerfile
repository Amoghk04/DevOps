FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG MONGO_PASS
ENV MONGO_PASS=${MONGO_PASS}

EXPOSE 3001
EXPOSE 3002

CMD ["npm", "start"]