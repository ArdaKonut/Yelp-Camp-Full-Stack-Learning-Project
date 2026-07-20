const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(() => {
    console.log("Mongo connection open!")
})
.catch(err => {
    console.log("Mongo connection error: ")
    console.log(err);
});

// Basic logic to check whether the DB is successfully up and running!
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)


app.get('/', (req, res) => {
    res.render('home');
})

/*
app.post('/campgrounds', catchAsync(async(req, res, next) => {
// We throw the error here because
// this async function is wrapped up with catchAsync, 
// so the thrown error will be caught by the predefined '.catch()',
// and hand it off to 'next()'.
        if(!req.body.campground) throw new ExpressError('Invalid campground data', 400);
        const campground = new Campground (req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
}));
*/


// For every single request, for every single path!
// This will only run if nothing else is matched first. So the order and placement is so important.
app.all('/{*path}', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, Something went wrong!'
    res.status(statusCode).render('error', { err });
})

app.listen(5051, () => {
    console.log('Serving on port 5051!')
})

