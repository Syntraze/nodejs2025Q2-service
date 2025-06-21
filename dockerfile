FROM node:22-alpine3.20 AS building

WORKDIR /app

# Install dependencies
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci

# Copy all source files
COPY . .

# 🛠️ Generate Prisma client before TypeScript build
RUN npx prisma generate

# 🏗️ Build NestJS app (uses generated Prisma types)
RUN npm run build


FROM node:22-alpine3.20 AS prod

WORKDIR /app

# Copy built app and node_modules
COPY --from=building /app .

# Optional: run migrations or seeding
# Replace with "node dist/main.js" if this is not what you want
CMD ["npm", "run", "prisma:init"]
