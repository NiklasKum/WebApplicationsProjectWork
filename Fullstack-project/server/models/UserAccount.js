const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userAccSchema = new Schema({
    admin: Boolean,
    username: String,
    email: String,
    password: String,
    upvoted: [String],
    downvoted: [String]
});

module.exports = mongoose.model("UserAccount", userAccSchema);