const path = require('path');
const fs = require('fs');
//const https = require('https');

const express = require('express');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helemt = require('helmet'); // add some secure additional headers to the respense 
const compression = require('compression');
const morgan = require('morgan');

const accessStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
// const privteKey = fs.readFileSync(path.join(__dirname, 'server.key'));
// const certificate = fs.readFileSync(path.join(__dirname, 'server.cert'));

const app = express();

const jobsRoutes = require('./routes/job');
const authRoutes = require('./routes/auth');


app.use(helemt());
app.use(compression()); // help with reduce assets 
app.use(morgan('combined', { stream: accessStream }))
app.use(express.static(path.join(__dirname, 'front-end', 'public')));
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'DELETE,PUT,GET,PATCH,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization ');
    next();
});
app.use('/auth/', authRoutes);
app.use('/jobs/', jobsRoutes);
app.use((req, res, next) => {
    const error = new Error('resource not found ');
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(500 || error.status).json({
        message: error.message, //deafult exsists (message )
        data: error.data
    })
});

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.njaiivm.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`).then(result => {
    const port = process.env.PORT || 3001;
    console.log(`the server is listen on port ${port}`);
    const server = app.listen(port);

    const io = require('./socket').init(server); //io is object that set up websocket protocol 
    //this function will excute ffor every connctions and its eventlistner  
    io.on('connection', socket => {
        //socket : connction between clinet and the server 
        console.log('client connected');
    })


    // https.createServer({ key: privteKey, cert: certificate }, app).listen(port);

}).catch(err => {
    console.log(err);
})