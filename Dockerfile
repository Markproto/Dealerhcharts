FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace package.json files
COPY package.json ./
COPY server/package.json ./server/
COPY shared/ ./shared/

# Install dependencies (workspaces will link shared)
RUN npm install --workspace=server --workspace=shared

# Copy server source
COPY server/ ./server/

# Expose API port
EXPOSE 3001

# Start the server
CMD ["node", "server/src/index.js"]
