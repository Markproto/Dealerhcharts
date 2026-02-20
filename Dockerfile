FROM node:20-alpine

WORKDIR /app

# Copy shared module first
COPY shared/ ./shared/

# Copy server package.json and install dependencies
COPY server/package.json ./server/
WORKDIR /app/server
RUN npm install

# Copy server source
COPY server/ /app/server/

# Expose API port
EXPOSE 3001

# Start the server
CMD ["node", "src/index.js"]
