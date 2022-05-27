# ---- BUILDER ----
# Setup production builder
FROM node:16-alpine as builder
WORKDIR /root

# Install dependencies
COPY package*.json ./
RUN yarn install

# Build the project
COPY . .
RUN yarn build
# ---- END BUILDER ----


# ---- APP ----
# Setup production executor
FROM node:16-alpine as app
WORKDIR /root

# Install production dependencies
COPY package*.json ./
RUN yarn install --prod

# Run the production build
COPY --from=builder /root/dist ./dist
CMD [ "yarn", "start" ]
# ---- END APP ----