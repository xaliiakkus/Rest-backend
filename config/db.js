const mongoose = require('mongoose');

const db = () => {
    mongoose.connect('mongodb+srv://dbusers:mBnsbNHcJU9tcPzw@cluster0.lk7v5.mongodb.net/?authSource=admin&retryWrites=true&w=majority&appName=Cluster0', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() =>
        console.log('Mongo DB  Connection Successful')
    ).catch((err) => {
            console.error(err);
        });
}
module.exports = db