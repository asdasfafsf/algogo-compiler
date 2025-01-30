# --- Step 1: Build Stage (Node.js 빌드 전용) ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN npm install -g @nestjs/cli
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# --- Step 2: Production Stage ---
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Update package list and install runtime dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    python3 \
    python3-pip \
    wget \
    software-properties-common \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22 (to provide npm and pnpm)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Determine the architecture and install the appropriate Amazon Corretto JDK
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        wget -O- https://corretto.aws/downloads/latest/amazon-corretto-21-x64-linux-jdk.tar.gz | tar -xz -C /opt; \
    elif [ "$ARCH" = "aarch64" ]; then \
        wget -O- https://corretto.aws/downloads/latest/amazon-corretto-21-aarch64-linux-jdk.tar.gz | tar -xz -C /opt; \
    else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
    fi && \
    ln -s /opt/amazon-corretto-21.* /opt/amazon-corretto-21 && \
    ln -s /opt/amazon-corretto-21/bin/java /usr/bin/java && \
    ln -s /opt/amazon-corretto-21/bin/javac /usr/bin/javac

# Verify JDK installation
RUN java -version

# Set working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install pnpm and only production dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Default command
CMD ["node", "dist/main"]