"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    file: String,
}, { timestamps: true });
exports.MessageModel = mongoose_1.default.model('Message', MessageSchema);
