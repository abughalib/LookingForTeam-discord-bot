# Looking For Team invite discord bot.

## Specially Designed for Elite Dangerous Community.

## Configure

- Make Sure you have [Node 18+ Installed](https://nodejs.org/en/download/)
- [Create a Discord bot](https://discord.com/developers/applications)
- Goto Bot in Discord Developer Portal->settings

  - Give your Bot a nice name and Picture
  - Reset Token, Enter 2FA code (if you have any)
  - Copy the Token and set your evironment variable.
    - In Windows
      - Search for `Edit the system enviroment variables`
      - Select the result it would take you to System Properties.
      - Click on Environment Variables
      - Under Uservariables for "Your Username"-> Click New.
      - Variable Name: `LOOKING_BOT_TEAM_TOKEN` && Variable Value: `Your Bot Token`
      - Select OK -> OK -> OK, Restart your Terminal, CMD or IDE.
    - In Linux
      - Open your Terminal and use the command
        ```bash
        export LOOKING_BOT_TEAM_TOKEN=your_token_here
        ```
      - To make it persist add it to User's Profile
      - In Terminal
        ```bash
        nano ~/.bash_profile
        ```
      - Add the following at the end of the file
        ```bash
        export LOOKING_BOT_TEAM_TOKEN=your_token_here
        ```

- Select your bot on Discord Developer Portal->OAuth2->URL Generator
  - In scope
    - Select `bot`.
  - In Bot Permission
    - `Read Messages`
    - `Send Messages`
    - `Manage Messages`
    - `Use Slash Commands`
- Copy Generated Url and open it on a web browser and select Server.
## Build
- Using NPM
  ```bash
  npm install
  ```
  ```bash
  npm run build
  ```
- Docker
  ```bash
    docker build .
  ```
## Run dev mode

- Start using NPM 
  ```bash
  npm start
  ```
- Manually
  ```bash
  ts-node index.ts
  ```
## Run production mode
- using Node
  ```bash
  node dist/index.js
  ```
- using Docker
  ```bash
  docker-compose up
  ```
