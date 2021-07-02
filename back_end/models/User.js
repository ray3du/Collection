const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/collections');

const UserSchema = mongoose.Schema({
    email: String,
    password: String
})


let User = mongoose.model('User', UserSchema);

module.exports = User;