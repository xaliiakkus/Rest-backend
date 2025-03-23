const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const dotenv = require('dotenv');
const db = require('./config/db.js');
const product = require('./routes/product');
const cloudinary = require('cloudinary').v2;
const user = require('./routes/user');


dotenv.config();
const app = express();
app.use(cors())


          
cloudinary.config({ 
  cloud_name: 'daesl3nc6', 
  api_key: '832495626472282', 
  api_secret :'cloudinary://832495626472282:hEhWr8J1_HmdP8Iceix2nx1WNBQ@daesl3nc6'


});

app.use(bodyparser.json({ limit: '30mb', extended: true }));
app.use(bodyparser.urlencoded({ limit: '30mb', extended: true }));
app.use(cookieparser())

db();

app.use('/', user);
app.use('/', product);

const PORT = process.env.PORT;


app.get('/', (req, res) => {
    res.status(200).json({message:'hello '})
})
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    });
