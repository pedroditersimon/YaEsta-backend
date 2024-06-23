// get database
import { dbHandler } from "../db/DatabaseHandler.mjs";
import { User } from "../models/models.mjs";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken"
const TOKEN_SECRET = process.env.TOKEN_SECRET;

import express, { json } from "express";
const router = express.Router();

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

const removeCookie = (res) => {
    res.cookie("auth_token", null, {
        httpOnly: true,
        maxAge: 1, // 1ms
    });
    return res;
 }

// ------------ logout ------------>
const logout = async (req, res, next) => {
    removeCookie(res);
    return res.status(200).json({ message: `Logout!` });
};
router.route('/logout').post(logout); // GET

// ------------ register ------------>
const register = async (req, res, next) => {
    var { username, password, repeat_password } = req.body;

    // check password
    if (password.length < 8 || password != repeat_password) 
        return res.status(400).json({ error: `Invalid password!` });

    if (username.length < 4)
        return res.status(400).json({ error: `Username too short!` });

    // check user exists
    var usernameExists = await dbHandler.username_exists(username);
    if (usernameExists) 
        return res.status(409).json({ error: `username already in use!` });

    var hash = await bcrypt.hash(password, 10);

    var user = new User({
        // _id is assigned by dbHandler
        username: username,
        password: hash
    });

    // set in db
    const result = await dbHandler.register_user(user);
    if (!result.acknowledged)
        return res.status(409).json({ message: `An registration error ocurred!` });

    // after registration -> login
    return login(req, res, next);
};
router.route('/register').post(register); // POST


// ------------ login ------------>
const login = async (req, res, next) => {
    var { username, password } = req.body;

    // check password
    if (password.length < 8) {
        return removeCookie(res).status(401).json({ message: `Invalid password!` });
    }

    // get user from db
    var user = await dbHandler.get_user_by_name(username);
    if (!user.isValid()) 
        return removeCookie(res).status(401).json({ message: `Invalid credentials!` });

    // check credentials
    var match = await bcrypt.compare(password, user.password);
    if (!match) 
        return removeCookie(res).status(401).json({ message: `Invalid credentials!` });


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
router.route('/login').post(login); // POST


// ------------ token authentication middleware ------------>
export const verifyToken = (req, res, next) => {
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
export const compareUserAuth = (req, user_id) => {
    var auth = new Auth(req.auth);

    // invalid object
    if (!auth.isValid())
        return false;
    
    return auth._id == user_id;
};

export const notAuthorizedError = (res) => {
    return res.status(401).json({ message: `Not Authorized` });
};

// ------------ Warning middleware ------------>
export const warningRoute = (req, res, next) => {
    console.log("Warning: This API route is being accessed.");
    return next();
};

export { router }