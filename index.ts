import DiscordJS, { Client, IntentsBitField } from 'discord.js';


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages
    ]
});

client.on('ready', ()=> {
    console.log("The bot is ready!");
    const guildId = '923701565158744155';
    const guild = client.guilds.cache.get(guildId);
});

client.login(process.env.LOOKING_BOT_TEAM_TOKEN)