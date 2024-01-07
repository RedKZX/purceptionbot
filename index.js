const { Client, GatewayIntentBits, AuditLogEvent,AttachmentBuilder, ModalBuilder, TextInputStyle, TextInputBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, MessageType } = require(`discord.js`);
const fs = require('fs');
const { Partials } = require('discord.js');
const client = new Client({ intents: [Object.keys(GatewayIntentBits), GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions,  GatewayIntentBits.GuildVoiceStates,  GatewayIntentBits.GuildMembers],
partials: [Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User],
 }); 
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require ('discord.js');
const axios = require ('axios');
const { ChannelType } = require('discord.js');

var colors = require('@colors/colors');
const { DisTube } = require("distube");
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Stream = require("./modules/getStreams.js")
const Auth = require("./modules/auth.js")
const Channel = require("./modules/channelData.js")
const config = require('./config.json');
var CronJob = require('cron').CronJob;

require('dotenv').config();

const {loadEvents} = require('./src/Handlers/eventHandler');
const {loadCommands} = require('./src/Handlers/commandHandler');

client.login(process.env.token).then(() => {
    loadEvents(client);
    loadCommands(client);

    UpdateAuthConfig()
});

//Twitch

var Check = new CronJob(config.cron,async function () {
    const tempData = JSON.parse(fs.readFileSync('./config.json'))

    tempData.channels.map(async function (chan, i) {
        if (!chan.ChannelName) return;
        
        let StreamData = await Stream.getData(chan.ChannelName, tempData.twitch_clientID, tempData.authToken);
        if (StreamData.data.length == 0) return

        StreamData = StreamData.data[0]

       
        const ChannelData = await Channel.getData(chan.ChannelName, tempData.twitch_clientID, tempData.authToken)
        if (!ChannelData) return;

        const streamembed = new EmbedBuilder()
        .setTitle(`🔴 ${StreamData.user_name} is now live!`)
        .setDescription(`${StreamData.title}`)
        .setURL(`https://www.twitch.tv/${StreamData.user_login}`)
        .setColor(`Blue`)
        .addFields({ name: "Playing", value: `> ${StreamData.game_name}`, inline: true})
        .addFields({ name: "Viewers", value: `${StreamData.viewer_count}`, inline: true})
        .addFields({ name: "Twitch", value: `[Watch stream](https://www.twitch.tv/${StreamData.user_login})`})
        .setFooter({ text: `${StreamData.started_at}`})
        .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${StreamData.user_login}-640x360.jpg?cacheBypass=${(Math.random()).toString()}`)
        .setThumbnail(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${StreamData.user_login}-640x360.jpg?cacheBypass=${(Math.random()).toString()}`)

        const sendChannel = client.guilds.cache.get(config.DiscordServerId).channels.cache.get(config.channelID)
        
        if (chan.twitch_stream_id == StreamData.id) {
            sendChannel.messages.fetch(chan.discord_message_id).then(msg => {
            
                msg.edit({ embed: streamembed })
            });
        } else {
            //Noti role
            sendChannel.send(`@everyone`)
            await sendChannel.send({ embeds: [streamembed] }).then(msg => {
                const channelObj = tempData.channels[i]
                
                channelObj.discord_message_id = msg.id
                channelObj.twitch_stream_id = StreamData.id
                
            })
        }
        
        fs.writeFileSync('./config.json', JSON.stringify(tempData))
    })
});


var updateAuth = new CronJob('0 * * * *', async function () {
    UpdateAuthConfig()
});

async function UpdateAuthConfig(){
    let tempData = JSON.parse(fs.readFileSync('./config.json'));

    
    const authKey = await Auth.getKey(tempData.twitch_clientID, tempData.twitch_secret);
    if (!authKey) return;

    
    var tempConfig = JSON.parse(fs.readFileSync('./config.json'));
    tempConfig.authToken = authKey;
    fs.writeFileSync('./config.json', JSON.stringify(tempConfig));
}


updateAuth.start()
Check.start();