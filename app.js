require('dotenv').config();
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connectDb = require('./server/config/db');
const cookieParser = require('cookie-parser')
const mongoStore = require('connect-mongo');
const session = require('express-session');
const { isActiveRoute } = require('./server/helper/routeHelper');

const app = express();
const port = process.env.PORT || 3000;
connectDb();

// use middleware to read the search post request 
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: "Blog in nodeJS",
    resave: false,
    saveUninitialized: true,
    store: mongoStore.create({
        mongoUrl: process.env.MONGODB_URL
    })
}))

app.use(express.static('public'));


// templete engine 
app.use(expressLayout);
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')


app.locals.isActiveRoute = isActiveRoute;

app.use("/", require("./server/routes/main"))
app.use("/", require("./server/routes/admin"))

app.listen(port, () => {
    console.log(`app listen on port ${port}`);
})