const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

// This is going to add on to our Schema a username. It is also going to add on a field for password.
// It is also going to make sure usernames are unique.
UserSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model('User', UserSchema);