const bcrypt = require('bcrypt');
const User = require('./db/userModel');
const express = require("express");
const app = express();
const dbConnect = require("./db/dbConnect");
const jwt = require('jsonwebtoken');
const auth = require('./auth/auth');
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

dbConnect();

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, 10)
    .then(hashedPassword => {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            confirmPassword: hashedPassword,
        })

        user.save()
        .then(result => {
            res.status(201).send({
                message: "User Succesfully Created",
                result,
            })
        })
        .catch(err => {
            res.status(500).send({
                message: "Error Creating User",
                err,
            })
        })
    })
    .catch((err) => {
        res.status(500).send({
            message: "Password was not hashed successfully",
            err,
        })
    }) 
})

app.post("/login", (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
        bcrypt.compare(req.body.password, user.password)
        .then(passwordCheck => {
            if(!passwordCheck){
                return res.status(400).send({
                    message: "Passwords doesn't match",
                    e,
                })
            }

            const token = jwt.sign({
                userId: user._id,
                userEmail: user.email
            },
            "RANDOM-TOKEN",
            {expiresIn: '2h'}
            );

            res.status(200).send({
                message: "Login Successful",
                email: user.email,
                token
            })
        })
        .catch(e => {
            res.status(404).send({
                message: "Passwords doesn't match",
                e,
            })
        });
    })
    .catch((e) => {
        res.status(500).send({
            message: "Email not found",
            e,
        })
    });
})

app.get("/authcheck", auth, (req, res) => {
    res.json({ message: "You are authorized to access me" });
})

app.listen(3000, () => {console.log("Server Started!!!")});

module.exports = app;