FROM node:boron
MAINTAINER Sam Rubin "srubin@deloitte.com"

# Set npm log level override
ENV NPM_CONFIG_LOGLEVEL warn
ENV NPM_CONFIG_PROGRESS false
ENV NPM_CONFIG_SPIN false

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 7000
CMD [ "npm", "start" ]
