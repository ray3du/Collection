const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    email: String,
    text: String
});

let Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;