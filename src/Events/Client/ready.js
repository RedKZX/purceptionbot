const {Client} = require('discord.js');
const mongoose = require('mongoose');
const mongodbURL = process.env.MONGODBURL;

module.exports ={
    name: "ready",
    once: true,
   async execute(client) {
    await mongoose.connect(mongodbURL || '', {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    mongoose.set('strictQuery', true);

    if (mongoose.connect) {
        console.log(` [SYSTEM] Connected to DataBase in  ${client.ws.ping} ms`.cyan)
    };
            console.log(' [HENREH] You wish you were special.'.red);
        },
};