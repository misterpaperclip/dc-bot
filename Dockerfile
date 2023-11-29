# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application code into the container
COPY . .

# Expose ports for text and voice chat
EXPOSE 443
EXPOSE 50000-65535/udp

# Define the command to run your Discord bot
CMD ["npm", "wbc_main_bot.js"]
