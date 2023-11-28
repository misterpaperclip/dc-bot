const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

// Set up the client with specified intents
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT,
    ],
});

// Read commands from the 'commands' folder
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data);

    // Set up interactionCreate event
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === command.data.name) {
            try {
                await command.execute(interaction);

                // Log important details
                console.log(`Command '${commandName}' executed by ${interaction.user.tag} in channel ${interaction.channel.name}`);
            } catch (error) {
                console.error(error);
                await interaction.reply(`Error executing command '${commandName}'. Please check the logs.`);
            }
        }
    });
}

// Retrieve client ID and token from environment variables
const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID;
const token = process.env.GITHUB_BOT_TOKEN || process.env.BOT_TOKEN;

// Set up REST client
const rest = new REST({ version: '9' }).setToken(token);

// Refresh application (/) commands
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Event when the bot is ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Log in with the specified token
console.log('Token:', token);
client.login(token);
