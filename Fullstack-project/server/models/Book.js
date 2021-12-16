const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let bookSchema = new Schema({
    name:String,
    author:String,
    pages:Number
});

module.exports = mongoose.model("Book", bookSchema);