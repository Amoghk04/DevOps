FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Add host flag to vite configuration
ENV VITE_HOST=0.0.0.0

EXPOSE 5173

# Use the host flag when starting vite

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]