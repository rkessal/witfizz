# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove existing build folder if it exists
RUN rm -rf build
RUN rm -rf node_modules

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set NODE_ENV for production build
ENV CI=false
ENV PUBLIC_URL=/workland

# Build the app using react-scripts
RUN npm run build

# Debug: List contents of build directory
RUN ls -la build/
RUN ls -la build/static/

# Production stage - just copy the build files
FROM alpine:latest

# Create directory for static files
RUN mkdir -p /app/build

# Copy built files from builder stage
COPY --from=builder /app/build /app/build

# Expose port
EXPOSE 5001

# Use a simple HTTP server to serve the files
RUN apk add --no-cache nodejs npm
RUN npm install -g serve

# Start the server
CMD ["serve", "-s", "build", "-l", "5001"] 