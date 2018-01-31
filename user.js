const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

var {ObjectID} = require('mongodb');

const {User} = require('./model/user_model');
const {mongoose} = require('./database/db');
const {authenticate} = require('./middleware/authenticate');

var app= express();

app.use(bodyParser.json());

app.post('/user',(req, res)=>{
    var body= _.pick(req.body,['email','password']);

    var user = new User(body);
    user.save().then(()=>{
        console.log(user);
        return user.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth',token).send(user);
    }).catch((e)=>{
        res.status(400).send(e);
    })
});

app.get('/user/me',authenticate,(req,res)=>{
    res.send(req.user);
});

app.post('/user/loging',(req,res)=>{
    var body= _.pick(req.body ,['email','password']);

    User.findByCredentials(body.email,body.password).then((user)=>{
        user.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send(user);
        });
    }).catch((e)=>{
        res.status(400).send();
    });
});

app.delete('/user/me/token',authenticate ,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    })
});

app.listen(8888,()=>{
    console.log("Started server on 8888");
});

module.exports={app};