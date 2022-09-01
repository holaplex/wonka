# Install dependencies only when needed
FROM node:16-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN apk add --no-cache git
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:16-alpine AS runner
RUN apk add --no-cache p7zip
WORKDIR /usr/app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build
ENV NODE_ENV production
EXPOSE 3000

ENV PORT 3000

CMD ["yarn", "start"]
