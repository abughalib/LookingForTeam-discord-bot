FROM node:latest

WORKDIR /usr/app
# Copy package.json file
COPY ["package.json", "./"]
RUN npm install
# Copy other resources
ADD . /usr/app

RUN npm run build

CMD ["node", "dist/index.js"]