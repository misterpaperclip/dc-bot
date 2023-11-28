const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const fs = require('fs');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT,
    ],
});


const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data);
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

const clientId = '1178936725494571058'; // Replace with your actual client ID
const token = 'MTE3ODkzNjcyNTQ5NDU3MTA1OA.GXuScL.C7cXcJ9BglMtUxzobGVleLfCA22hlb3vk_5C1g'; // Replace with your actual bot token

const rest = new REST({ version: '9' }).setToken(token);

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

client.login(token);
