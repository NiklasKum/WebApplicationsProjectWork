const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let codepostSchema = new Schema({
    poster: String,
    title: String,
    description: String,
    code: String,
    votes: Number,
    upvotes: Number,
    downvotes: Number,
    postdate: Date,
    language: String,
    comments: [{
        comment: String,
        commentorid: String,
        commentor: String,
        commentdate: Date,
        upvotes: Number,
        downvotes: Number
    }]
});

module.exports = mongoose.model("Codepost", codepostSchema);