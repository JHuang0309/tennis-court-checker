FROM mcr.microsoft.com/playwright:focal

# Set working directory
WORKDIR /app

# Copy package.json & install dependencies
COPY package*.json ./
RUN npm install

# Install Playwright browsers
RUN npx playwright install

# Copy source code
COPY ./src/ ./src/

# Expose port
EXPOSE 5005

# Start the server
CMD ["node", "src/server.js"]
