const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/test', {
    useMongoClient: true,
});

const Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
    name: String,
    password: String,
    admin: Boolean
}));
