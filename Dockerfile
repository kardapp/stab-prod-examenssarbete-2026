FROM node:20-alpine

WORKDIR /app

# Install dependencies based on package.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose Next.js port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=development

# Start Next.js app in dev mode (or standard start)
CMD ["npm", "run", "dev"]
