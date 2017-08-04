const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const User = require('./app/models/user');
const config = require('./config');

const app = express();
const apiRoutes = express.Router();

const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('secret', config.secret);
app.use(morgan('dev'));

app.get('/', function(req, res) {
    res.send(`Hello! the API is at http://localhost:${port}/api`)
})

app.get('/setup', function(req, res) {
    const nick = new User({
        name: 'JohnDoe',
        password: 'password',
        admin: true
    })

    nick.save(function(err) {
        if(err) {
            throw err;
        }
        console.log('User saved successfully')
        res.json({ success: true })
    })
})

apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) throw err;

        if(!user) {
            res.json({
                success: false,
                message: 'Authentication failed. User not found!'
            })
        } else if(user) {
            if(req.body.pass !== user.password) {
                res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password!'
                })
            } else {
                const token = jwt.sign(user, app.get('secret'), {
                    expiresIn: '1 day' // 24 hours
                });

                res.json({
                    success: true,
                    message: 'Enjoy your token',
                    token
                })
            }
        }
    })
})

apiRoutes.use(function(req, res, next) {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get('secret'), function(err, decode) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                })
            } else {
                req.decoded = decode;
                next();
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        })
    }
})

apiRoutes.get('/', function(req, res) {
    res.json({
        message: 'Welcome to the coolest API on earth!'
    })
})

apiRoutes.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    })
})

app.use('/api', apiRoutes);

app.listen(port);
console.log(`Listen at port ${port}`);
