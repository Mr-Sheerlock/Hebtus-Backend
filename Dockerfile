# Use an official Node.js runtime as a parent image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install
RUN npm install -g nodemon
#install pm2 process manager
RUN npm install -g pm2

# Copy the rest of the app source code to the working directory
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the app
CMD [ "npm", "start" ]

#using this command instead of npm start
#the pm2-runtime command is used instead of pm2 start to ensure that logs are displayed in the container output.
#CMD ["pm2-runtime", "start", "server.js"]
#To run the app in the background
#CMD ["pm2-runtime", "start", "server.js", "--name", "my-app", "--no-daemon"]
