# Set the base image
FROM node:16 as builder

# Set environment variables
ENV USER root
ENV HOME /root

# Set working directory
WORKDIR $HOME

# Copy project files
COPY . .

# Install prerequisites
RUN apt-get update -y
RUN apt-get install tor -y
RUN yarn install

# Build the project
RUN yarn build

# Set default command
CMD [ "yarn", "start" ]