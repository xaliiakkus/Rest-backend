const mongoose = require('mongoose');

const db = () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() =>
        console.log('Mongo DB  Connection Successful')
    ).catch((err) => {
            console.error(err);
        });
}
module.exports = db