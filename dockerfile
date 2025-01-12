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

# Install Amazon Corretto 21 (JDK 21)
RUN wget -O- https://apt.corretto.aws/corretto.key | gpg --dearmor | tee /usr/share/keyrings/amazon-corretto-archive-keyring.gpg
RUN echo 'deb [signed-by=/usr/share/keyrings/amazon-corretto-archive-keyring.gpg] https://apt.corretto.aws stable main' | tee /etc/apt/sources.list.d/corretto.list
RUN apt-get update && apt-get install -y java-21-amazon-corretto-jdk

# Install Node.js 22 (via NodeSource)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Install Nest CLI globally
RUN npm i -g @nestjs/cli

# Verify installations
RUN g++ --version && \
    python3 --version && \
    java --version && \
    node --version && \
    npm --version && \
    pnpm --version && \
    nest --version

# Set default command
CMD ["/bin/bash"]