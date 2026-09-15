if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport'); // Passport is an authenticated middleware for Express.
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const helmet = require('helmet');

// 'mongodb://localhost:27017/yelp-camp'
// const dbUrl = process.env.DB_URL;
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

// Basic logic to check whether the DB is successfully up and running!
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});

const app = express();
app.set('query parser', 'extended');

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

app.use(sanitizeV5({ replaceWith: '_' }));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // for lazy updating, by limiting a period of time! (24 hours in this case, does not matter how many requests are made)
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR!", e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // our cookies are only accessible through HTTP, not through JavaScript.
        // secure: true
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// This line must be set before 'passport.session'.
// Passport sessions depend on 'express-session', so session middleware must appear first.
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false })); // automatically enables all 11 middleware helmet comes with!

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://stackpath.bootstrapcdn.com/"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/bv2kolpv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://res.cloudinary.com/douqbebwk/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// Required to initialize passport.
app.use(passport.initialize());

// For persistent login session. Alternative would be having to login on every single request.
app.use(passport.session());

/** A Passport Strategy tells Passport how users should be authenticated.
 * This application currently uses: new LocalStrategy(...)
 * Which means authenticate users using a username and password stored in our own database. 
 * For the LocalStrategy, authentication method is going to be used on our User model.
 */

passport.use(new LocalStrategy(User.authenticate()))

// Serialization refers to how do we store user in the session.
passport.serializeUser(User.serializeUser())

// The opposite -> How to unstore a user from the session.
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {

    // In our all templates, we should have access to the current user by configuring the line below.
    // Anything placed in 'res.locals' becomes available to templates rendered during that request.
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home');
})

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

// Vercel is going to set the port number!
const port = process.env.PORT || 5051;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
