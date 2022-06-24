######## BUILDER ########

# Set the base image
FROM node:16-alpine as builder

# Set environment variables
ENV USER root
ENV HOME /root

# Set working directory
WORKDIR $HOME

# Copy project files
COPY . .

# Install prerequisites
RUN yarn install

# Build the project
RUN yarn build

######## INSTALL ########

# Set the base image
FROM node:16-alpine

# Set environment variables
ENV USER root
ENV HOME /root

# Set working directory
WORKDIR $HOME

# Copy project files
COPY package.json ./
COPY yarn.lock ./

# Copy project files from builder
COPY --from=builder /root/dist ./

# Install prerequisites
# FIXME: tor-downloader does not currently work with alpine
RUN apk add --no-cache tor
RUN yarn install --prod

# Set default command
CMD [ "yarn", "start" ]