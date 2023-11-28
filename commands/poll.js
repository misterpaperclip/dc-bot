const { Collection } = require('discord.js');

// Create a cooldowns collection to store the cooldown timestamps
const cooldowns = new Collection();

module.exports = {
    data: {
        name: 'poll',
        description: 'Create a poll with choices in a target channel.',
        options: [
            {
                name: 'question',
                type: 3, // STRING type
                description: 'The poll question.',
                required: true,
            },
            {
                name: 'choices',
                type: 3, // STRING type
                description: 'Poll choices separated by commas.',
                required: true,
            },
            {
                name: 'id',
                type: 7, // CHANNEL type
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
            const question = interaction.options.getString('question');
            const choices = interaction.options.getString('choices').split(',').map(choice => choice.trim());
            const channelId = interaction.options.getChannel('id').id;

            const targetChannel = await interaction.client.channels.fetch(channelId);

            // Create poll message
            const pollMessage = await targetChannel.send(`**${question}**\n\n${choices.map((choice, index) => `${index + 1}. ${choice}`).join('\n')}`);

            // Add reactions to the poll message
            for (let i = 0; i < choices.length; i++) {
                await pollMessage.react(`${i + 1}️⃣`);
            }

            // Collect votes
            const filter = (reaction, user) => user.id === interaction.user.id && reaction.emoji.name.endsWith('️⃣');
            const collector = pollMessage.createReactionCollector({ filter, time: 60000 }); // 60 seconds

            let userVotes = 0;

            collector.on('collect', (reaction) => {
                // Handle the vote (you can add your own logic here)
                const choiceIndex = parseInt(reaction.emoji.name.charAt(0)) - 1;
                const chosenChoice = choices[choiceIndex];
                console.log(`${interaction.user.tag} voted for: ${chosenChoice}`);
                
                userVotes++;
            });

            collector.on('end', () => {
                interaction.reply('Voting has ended.');
            });

            await interaction.reply('Poll created successfully!');

        } catch (error) {
            console.error(error);
            await interaction.reply('Error creating poll. Please check the provided parameters.');
        }

        // Remove the user from cooldown after the cooldown duration
        setTimeout(() => {
            cooldowns.delete(interaction.user.id);
        }, cooldownTime);
    },
};
