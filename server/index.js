const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 8000;

const db = require('./config/mongoose.js');

const User = require('./models/User');
const Post = require('./models/Post');

const app = express();

// app.use(
//     cors({
//       origin: "http://localhost:3000",
//       credentials: true,
//       methods: ["GET", "POST", "PUT", "DELETE"],
//     })
// );  
// app.use(express.json());

app.use(cors({
    origin: '*'
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(require('./router/auth'));

app.listen(port, function (err) {

    if (err) {
        console.log(err);
    }

    console.log("server is up and running on port:", port);

})