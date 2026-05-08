const mongoose = require('mongoose');
const cities = require("./cities");
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(() => {
    console.log("Mongo connection open")
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

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDb = async() => {
    await Campground.deleteMany({});
    for(let i=0; i<50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price =  Math.floor(Math.random() * 30) + 10;
        const camp =  new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere que repudiandae, perspiciatis debitis! Optio?',
            price: price


        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
})