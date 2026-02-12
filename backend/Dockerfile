# Use official Node slim image
FROM node:20-slim

# Install Linux dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libxss1 \
    libxshmfence1 \
    ca-certificates \
    fonts-liberation \
    wget \
    curl \
    gnupg \
    lsb-release \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Expose port
EXPOSE 5005

# Start the server
CMD ["node", "server.js"]
