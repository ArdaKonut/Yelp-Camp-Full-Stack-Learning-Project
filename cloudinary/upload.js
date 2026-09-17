const cloudinary = require('./index');
/**
 * req.files[].buffer
 *         ↓
 * uploadImage()
 *         ↓
 * Cloudinary
 *         ↓
 * Cloudinary stores actual image
 */

module.exports.uploadImage = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'YelpCamp',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};