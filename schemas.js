const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

/*What I'm doing here is defining an extension on joi.string called escapeHtml. So the idea is that I should be able to then apply .escapeHtml() on my string properties.
The syntax is odd but in here.The property .escapeHtml() needs to have a function called validate. Joi will call this automatically with whatever value is that it receives. */
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

/* This is not a Mongoose Schema!
 This is just going to validate our data (server side validation), 
 before we even attempt to save it with Mongoose */
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
 });


 module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
 })