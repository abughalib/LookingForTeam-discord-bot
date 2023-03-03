FROM node:18-alpine

# Env
ENV LOOKING_FOR_TEAM_BOT_TOKEN="DISCORD BOT API KEY"

WORKDIR /usr/app
# Copy package.json file
COPY ["package.json", "./"]
RUN npm install
# Copy other resources
ADD . /usr/app

RUN npm run build

CMD ["node", "dist/index.js"]