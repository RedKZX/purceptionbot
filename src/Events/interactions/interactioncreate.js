const { Interaction, Events  } = require("discord.js");
const fetch = require('node-fetch');



module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        


        if (!command) return

        const blacklist = require('../../Schemas.js/blacklist');
        const data = await blacklist.findOne({ User: interaction.user.id });
        
        if (data) return await interaction.reply({ content: `You have been **blacklisted** from using this bot! This means Red doesn't want you to use it's commands for any given reason`, ephemeral: false });
        
        try{
            await command.execute(interaction, client);
        } catch (error) {
            console.log(error);

            async (err) => {
                await interaction.reply({
                    content: 'Henreh has broken something! Do `/issues`.', 
                    ephemeral: true
                }).catch(err);  
            }
        } 
    },
};

