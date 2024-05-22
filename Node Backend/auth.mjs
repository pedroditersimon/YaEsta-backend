// get database
import { dbHandler, User } from "./db/DatabaseHandler.mjs";

// get pages
import { registerHtml, loginHtml } from "./html_pages/html_pages.mjs";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken"
const TOKEN_SECRET = process.env.TOKEN_SECRET;

import express, { json } from "express";
const authRouter = express.Router();

class Auth {
    _id;
    username = "";

    constructor(data=null) {
        if (data)
            Object.assign(this, data);
    }

    isValid() {
        return this._id != undefined && this._id != null;
    }
}

// ------------ register ------------>
const register = async (req, res, next) => {
    var { username, password, repeat_password } = req.fields;

    // check password
    if (password.length < 8 || password != repeat_password) 
        return res.status(401).json({ message: `Invalid password!` });

    // check user exists
    if (await dbHandler.username_exists(username)) 
        return res.status(401).json({ message: `username already in use!` });

    var hash = await bcrypt.hash(password, 10);

    var user = new User({
        // _id is assigned by dbHandler
        username: username,
        password: hash
    });

    // set in db
    await dbHandler.register_user(user);

    // after registration -> login
    return login(req, res, next);
};
authRouter.route('/register').get((req, res, next) => res.send(registerHtml)); // GET
authRouter.route('/register').post(register); // POST


// ------------ login ------------>
const login = async (req, res, next) => {
    var { username, password } = req.fields;

    // check password
    if (password.length < 8) 
        return res.status(401).json({ message: `Invalid password!` });

    // get user from db
    var user = await dbHandler.get_user_by_name(username);
    if (!user.isValid()) 
        return res.status(401).json({ message: `Invalid credentials!` });

    // check credentials
    var match = await bcrypt.compare(password, user.password);
    if (!match) 
        return res.status(401).json({ message: `Invalid credentials!` });


    var auth = new Auth({
        _id: user._id,
        username: user.username
    });

    // create token
    var payload = JSON.stringify(auth);
    var token = jwt.sign(payload, TOKEN_SECRET);

    res.cookie("auth_token", token, {
        httpOnly: true,
        maxAge: 3 * 60 * 60 * 1000, // 3hrs in ms
    });
    return res.status(200).json({ message: `Logged as ${username}!` });
};
authRouter.route('/login').get((req, res, next) => res.send(loginHtml)); // GET
authRouter.route('/login').post(login); // POST


// ------------ logout ------------>
const logout = async (req, res, next) => {
    res.cookie("auth_token", null, {
        httpOnly: true,
        maxAge: 1, // 1ms
    });
    return res.status(200).json({ message: `Logout!` });
};
authRouter.route('/logout').get(logout); // GET

// ------------ token authentication middleware ------------>
const verifyToken = (req, res, next) => {
    var token = req.cookies.auth_token;

    if (!token) 
        return res.status(401).json({ message: `Not logged` });
    
    try {
        var verified = jwt.verify(token, TOKEN_SECRET);

        var auth = new Auth(verified);
        // invalid object
        if (!auth.isValid())
            return res.status(401).json({ message: `Not logged` });

        // put auth in request
        req.auth = auth;

        return next();
    }
    catch (error) {
        return res.status(403).json({ message: "Token not valid" });
    }
};


// ------------ user authentication ------------>
const compareUserAuth = (req, user_id) => {
    var auth = new Auth(req.auth);

    // invalid object
    if (!auth.isValid())
        return false;
    
    return auth._id == user_id;
};

const notAuthorizedError = (res) => {
    return res.status(401).json({ message: `Not Authorized` });
};

export { authRouter, verifyToken, compareUserAuth, notAuthorizedError }