const mongoose=require('mongoose');

mongoose.connect('mongodb+srv://vanshajbajaj:mediumclone@cluster0.oawzygi.mongodb.net/');

const db=mongoose.connection;

db.on('error',console.error.bind(console,"error while connecting to db"));

db.once('open',function(){
    console.log("successfully connected to database");
})