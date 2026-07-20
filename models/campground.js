const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
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