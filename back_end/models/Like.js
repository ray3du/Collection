const mongoose = require('mongoose');

const LikeSchema = mongoose.Schema({
    author: String,
    count: { 
        type: Number
    }
})

let Like = mongoose.model('Like', LikeSchema)

module.exports = Like