const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const nodemailerSendgridTransport = require('nodemailer-sendgrid-transport');


const User = require('../models/user');


const transporter = nodemailer.createTransport(nodemailerSendgridTransport({
    auth: {
        api_key: ''
    }
}))

exports.signUp = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('input validation faild');
        error.status = 422;
        error.data = errors.array();
        throw error
            // return res.status(422).json({
            //     message: "input validation failed"
            // })
    }

    User.findOne({ email: email }).then(user => {
        if (user) {
            return res.json({
                message: 'the user is aleardy exists'
            })
        };
        bcrypt.hash(password, 12).then(hashedPassword => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword
            });
            return user.save();
        }).then(result => {
            transporter.sendMail({
                to: result.email,
                from: 'email',
                subject: 'Account created succsufly',
                html: '<h2> your account is created <h2>'
            }).catch(err => {
                console.log(err)
            })
            res.status(201).json({
                message: 'user add successufely',
                userId: result._id
            })
        }).catch(err => {
            if (!err.status) {
                err.status = 500;
            }
            next(err);
        });
    })
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({ email: email }).then(user => {
            if (!user) {
                const error = new Error('user not found');
                error.status = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password)
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('wrong password');
                error.status = 401;
                throw error
            }
            const token = jwt.sign({ userId: loadedUser._id.toString(), email: loadedUser.email }, 'secertkey', {
                expiresIn: '1h'
            });
            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString()
            })
        })
        .catch(err => {
            if (!err.status) {
                err.status = 500;
            }
            next(err)
        })
};

exports.getResetPassword = (req, res, next) => {
    const email = req.body.email;
    let token;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
        };
        token = buffer.toString('hex');
    })

    User.findOne({ email: email }).then(user => {
        user.token = token;
        user.experrationToken = Date.now() + 3600000;
        return user.save();
    }).then(result => {
        transporter.sendMail({
            to: result.email,
            from: 'email',
            subject: 'reset your password',
            html: `<h2>click at this link</h2>
            <a href="http://localhost:3001${result.token}">link</a>`
        })
        res.status(200).json({
            message: 'the token for reset password',
            token: token
        })

    }).catch(err => {
        if (!err.status) {
            err.status = 500
        };
        next(err);
    })

};

exports.resetPassword = (req, res, next) => {
    const token = req.params.token;
    const password = req.body.password;
    let loadedUser;

    User.findOne({ token: token, experrationToken: { $gt: Date.now() } }).then(user => {
        if (!user) {
            res.status(404).json({
                messge: 'user  not found '
            });
        }
        loadedUser = user;
        return bcrypt.hash(password, 12);
    }).then(hashedPassword => {
        loadedUser.password = hashedPassword;
        return loadedUser.save();
    }).then(result => {
        res.status(201).json({
            message: 'password changed succefuly',
            userId: req.userId
        })
    }).catch(err => {
        console.log(err);
    })
}