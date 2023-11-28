const { Collection, MessageActionRow, MessageButton } = require('discord.js');

// Create a cooldowns collection to store the cooldown timestamps
const cooldowns = new Collection();

module.exports = {
    data: {
        name: 'message',
        description: 'Send a message to a target channel.',
        options: [
            {
                name: 'message',
                type: 3,
                description: 'The message to send.',
                required: true,
            },
            {
                name: 'id',
                type: 7,
                description: 'The ID of the target channel.',
                required: true,
            },
        ],
    },
    execute: async (interaction) => {
        const now = Date.now();
        const cooldownTime = 10000; // 10 seconds cooldown

        // Check if the user is on cooldown
        if (cooldowns.has(interaction.user.id)) {
            const remainingCooldown = cooldowns.get(interaction.user.id) + cooldownTime - now;
            return interaction.reply(`You're on cooldown. Please wait ${Math.ceil(remainingCooldown / 1000)} seconds before using this command again.`);
        }

        // Set the user on cooldown
        cooldowns.set(interaction.user.id, now);

        try {
            const message = interaction.options.getString('message');
            const channelId = interaction.options.getChannel('id').id;

            const targetChannel = await interaction.client.channels.fetch(channelId);
            targetChannel.send(message);
            await interaction.reply('Message sent successfully!');
        } catch (error) {
            console.error(error);
            await interaction.reply('Error sending message. Please check the provided parameters.');
        }

        // Remove the user from cooldown after the cooldown duration
        setTimeout(() => {
            cooldowns.delete(interaction.user.id);
        }, cooldownTime);
    },
};
