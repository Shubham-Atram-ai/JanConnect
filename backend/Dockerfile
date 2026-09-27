FROM node:20-alpine AS builder

WORKDIR /app

# 1. Install root dependencies (for Prisma)
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

# 2. Install backend dependencies
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# 3. Build backend
COPY backend/ ./
RUN npm run build

# 4. Production image
FROM node:20-alpine
WORKDIR /app

# Copy root and generate prisma client for runtime
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install --production
RUN npx prisma generate

# Setup backend runtime
WORKDIR /app/backend
COPY --from=builder /app/backend/package.json ./
RUN npm install --production
COPY --from=builder /app/backend/dist ./dist

# Create uploads directory
RUN mkdir -p /app/uploads/janconnect-media && chmod -R 777 /app/uploads

EXPOSE 3000
CMD ["node", "dist/main.js"]
