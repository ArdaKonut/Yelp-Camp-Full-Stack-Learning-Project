const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

// 'this' refers to the particular image
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

/** Why Virtual? 
 * 
 * So the reason we use a virtual is that we don't need to store this on our model or in the database,
 * because it's just derived from the information we are already storing.
 * We are storing the url, that means we are going to have to make a request to get the image anyway.
 * It's not like we are storing an image in Mongo, it's just a url.
 * So why store two if we can just make a virtual property as if it's sored in our database, but it's not? 
 */ 

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry : {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: [ 'Point' ], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


// 'this' refers to the particular image
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0,20)}...</p>`;
});


// The code written below is a Mongoose middleware.
// Types of middleware in Mongoose: Query middleware and Document middleware.
// This is a query middleware!
// Whenever a campground is deleted, automatically clean up its reviews. That is exactly what this middleware does!
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    // The purpose of doc -> After deleting it, Mongoose passes that deleted document into the middleware.
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
                // $in means delete every review whose _id is in this array.
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema);