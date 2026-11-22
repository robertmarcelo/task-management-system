
FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npx prisma generate --config prisma7.config.ts && npx prisma migrate deploy --config prisma7.config.ts && npm run dev"]
