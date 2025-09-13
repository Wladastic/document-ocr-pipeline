# Use Node.js 20 Alpine for smaller image size and compatibility
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create storage directory
RUN mkdir -p storage

# Expose the port
EXPOSE 3002

# Start the application using vite-node to run TypeScript directly
CMD ["npm", "start"]