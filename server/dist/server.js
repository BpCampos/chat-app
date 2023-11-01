"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const jwt = __importStar(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const User_1 = require("./models/User");
const Message_1 = require("./models/Message");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const ws_1 = require("ws");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongodbConnection = process.env.DATABASE_URI;
mongoose_1.default.connect(mongodbConnection);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt_1.default.genSaltSync(10);
const app = (0, express_1.default)();
const port = 3030;
app.use('/uploads', express_1.default.static(__dirname + '/uploads'));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));
app.use((0, cookie_parser_1.default)());
function getUserDataFromRequest(req) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var _a;
            const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err)
                        throw err;
                    resolve(userData);
                });
            }
            else {
                reject('no token');
            }
        });
    });
}
app.get('/messages/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const userData = yield getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = yield Message_1.MessageModel.find({
        sender: { $in: [userId, ourUserId] },
        recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 });
    res.json(messages);
}));
app.get('/profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err)
                throw err;
            res.json(userData);
        });
    }
    else {
        res.status(401).json('No token');
    }
}));
app.get('/people', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield User_1.UserModel.find({}, { _id: 1, username: 1 });
    res.json(allUsers);
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const userFound = yield User_1.UserModel.findOne({ username });
    if (userFound) {
        const passOk = bcrypt_1.default.compareSync(password, userFound.password);
        if (passOk) {
            jwt.sign({ userId: userFound._id, username }, jwtSecret, {}, (err, token) => {
                res.cookie('token', token, { sameSite: 'none', secure: true }).json({
                    id: userFound._id,
                });
            });
        }
    }
}));
app.post('/logout', (req, res) => {
    res.cookie('token', '', { sameSite: 'none', secure: true }).json('ok');
});
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const hashedPassword = bcrypt_1.default.hashSync(password, bcryptSalt);
        const createdUser = yield User_1.UserModel.create({ username: username, password: hashedPassword });
        jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
            if (err)
                throw err;
            res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
                id: createdUser._id,
                username,
            });
        });
    }
    catch (error) {
        res.status(500).json('error');
    }
}));
const server = app.listen(port, () => console.log(`Server running on port: http://localhost:${port}/`));
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (connection, req) => {
    function notifyOnlinePeople() {
        ;
        [...wss.clients].forEach((client) => {
            client.send(JSON.stringify({
                online: [...wss.clients].map((c) => ({ userId: c.userId, username: c.username })),
            }));
        });
    }
    setInterval(() => {
        notifyOnlinePeople();
    }, 5000);
    //* read username and id from the cookie for this connection
    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenCookieString = cookies.split(';').find((str) => str.startsWith('token='));
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err)
                        throw err;
                    const { userId, username } = userData;
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }
    connection.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const messageData = JSON.parse(message.toString());
        const { recipient, text, file } = messageData;
        let filename = null;
        if (file) {
            const extName = path_1.default.extname(file.info);
            filename = Date.now() + extName;
            const pathName = __dirname + '/uploads/' + filename;
            const bufferData = new Buffer(file.data.split(',')[1], 'base64');
            fs_1.default.writeFile(pathName, bufferData, () => {
                console.log('file saved: ' + pathName);
            });
        }
        if (recipient && (text || file)) {
            const messageDoc = yield Message_1.MessageModel.create({
                sender: connection.userId,
                recipient: recipient,
                text: text,
                file: file ? filename : null,
            });
            [...wss.clients]
                .filter((c) => c.userId === recipient)
                .forEach((c) => c.send(JSON.stringify({
                text,
                sender: connection.userId,
                recipient,
                file: file ? filename : null,
                _id: messageDoc._id,
            })));
        }
    }));
    //* Notify everyone about online people
    notifyOnlinePeople();
});
