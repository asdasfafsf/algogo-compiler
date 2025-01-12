# Use Ubuntu 24 as the base image
FROM ubuntu:24.04

# Set environment variables to prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update the package list and install essential packages
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    curl \
    python3 \
    python3-pip \
    wget \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22 (via NodeSource)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy dist folder from local machine
COPY dist ./dist

# Set environment variables for production
ENV NODE_ENV=production

# Default command
CMD ["node", "dist/main"]