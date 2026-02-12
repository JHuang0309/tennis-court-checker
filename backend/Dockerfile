# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json & install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY ./src/ ./src/

# Expose port
EXPOSE 5005

# Start the server
CMD ["node", "src/server.js"]
