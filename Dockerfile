# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in package.json
RUN npm install

# Make port 8080 available to the world outside the container
EXPOSE 8080

# Define the command to run the app
CMD [ "node", "app.js" ]