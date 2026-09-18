# YelpCamp

[**Live Demo**](https://yelp-camp-ten-flame.vercel.app/)
YelpCamp is a full-stack campground discovery and review platform built with Node.js, Express, MongoDB, Mongoose, and EJS. Users can register and authenticate, create and manage campground listings, upload images, explore locations through interactive maps, and publish reviews.

The application follows an MVC-oriented server-side architecture with persistent session-based authentication, resource-level authorization, server-side validation, cloud-based image storage, geospatial data integration, centalized error handling, and layered security controls. 

Originally developed while completing Colt Steele's Web Developer Bootcamp, the project was subsequently revisited and modernized to update dependencies, improve security and production compatibility, redesign the image-upload pipeline, and deploy the application as a production-accessible web service.

## Key Features

- **User Authentication** - Registration, login, logout and persistent sesson-based authentication using Passport.js.
- **Resource Authorization** - Ownership checks protect campground and review modification routes from unauthorized users.
- **Campground CRUD** - Authenticated users can create, view, edit, and delete campground listings.
- **Review System** - Users can publish ratings and reviews, with ownership-based deletion controls.
- **Cloud Image Management** - Multiple campground images are processed through Multer and uploaded to Cloudinary using a memory-budder and upload-stream architecture.
- **Interactive Maps** - Mapox geocoding converts campground locations into geographic coordinates used for individual maps and clustered campground visualization.
- **Security Hardening** - Helmet security headers, Content Security Policy, HTML sanitization, MongoDB query sanitization, secure session configuration, and authorization middleware provide multiple defensive layers.
- **Centralized Error Handling** - Asynchronous controller failures and custom HTTP errors are routed through a shared Express error-handling pipeline.
- **Responsive Server-Rendered UI** - EJS, ejs-mate, Bootstrap, custom CSS and client-side JavaScript provide reusable layouts and responsive interfaces.
- **Production Deployment** - The application is deployed through Vercel with MongoDB Atlas and externally hosted Cloudinary/MapBox services.

## Technology Stack

| Layer | Technologies |
| --- | ---|
| **Runtime & Backend** | Node.js, Express.js |
| **Frontend** | EJS, ejs-mate, Bootstrap, CSS, JavaScript |
| **Database & ODM** | MongoDB Atlas, Mongoose |
| **Authentication** | Passport, passport-local passport-local-mongoose |
| **Session Management** | express-session, connect-mongo |
| **Validation & Sanitization** | Joi, sanitize-html, express-mongo-sanitize |
| **Image Processing & Storage** | Multer, Cloudinary |
| **Maps & Geocoding** | MapBox GL JS, MapBox Geocoding API |
| **Security** | Helmet, Content Security Policy |
| **Deployment & Version Control** | Vercel, Git, GitHub |

## Application Architecture
YelpCamp follows an MVC-oriented architecture that separates HTTP routing, application logic, persistence and presentation concerns.

Requests pass through an Express middleware pipeline before reaching controller functions, Controllers coordinate application logic and interact with Mongoose models, while EJS templates render the resulting data into server-generated HTML.
```text
Client / Browser
       │
       │ HTTP Request
       ▼
┌─────────────────────┐
│    Express Router   │
└──────────┬──────────┘
           │
           ▼
┌───────────────────────────────┐
│       Middleware Layer        │
│                               │
│ Authentication                │
│ Authorization                 │
│ Joi Validation                │
│ Multer File Processing        │
│ Security / Sanitization       │
└──────────┬────────────────────┘
           │
           ▼
┌─────────────────────┐
│     Controllers     │
└──────────┬──────────┘
           │
           ├───────────────────┐
           ▼                   ▼
┌─────────────────────┐  ┌──────────────────┐
│   Mongoose Models   │  │ External Services│
└──────────┬──────────┘  │ Cloudinary       │
           │             │ Mapbox           │
           ▼             └──────────────────┘
┌─────────────────────┐
│    MongoDB Atlas    │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│      EJS Views      │
└──────────┬──────────┘
           │
           ▼
     HTML Response
```

## Authentication & Authorization

YelpCamp uses **Passport** with a local authentication strategy to manage user registration, login, logout, and authenticated sessions.

User credentials are handled through `passport-local-mongoose`, while `express-session` maintains authentication state between HTTP requests. Production sessions are persisted through **MongoDB using connect-mongo** rather than relying on Express's default in-memory session store.

### Authentication Flow

```text
User Credentials
       │
       ▼
Passport LocalStrategy
       │
       ▼
User Authentication
       │
       ▼
Express Session
       │
       ▼
MongoDB Session Store
       │
       ▼
Session Cookie
       │
       ▼
Subsequent HTTP Request
       │
       ▼
Passport deserialization
       │
       ▼
req.user
```

Authentication and authorization are handled separately. Authentication establishes the user's identity, while authorization middleware determines whether that user owns the requested resource.

Protected campground operations therefore follow a middleware chain similar to:

```text
PUT /campgrounds/:id
          │
          ▼
     isLoggedIn
          │
          ▼
       isAuthor
          │
          ▼
     Validation
          │
          ▼
      Controller
```
The same ownership model protects review deletion, preventing authenticated users from modifying resources belonging to other users.

## Database Design & Relationships

YelpCamp uses **MongoDB Atlas** for persistent application data and **Mongoose** as the Object Document Mapper (ODM).

The application is primarily structued around three domain models:
```text
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ authors
       ▼
┌─────────────┐
│ Campground  │
└──────┬──────┘
       │
       │ contains
       ▼
┌─────────────┐
│   Review    │
└─────────────┘

User ───────────────► Review
       authors
```
Campgrounds store references to their author and associated reviews using Mongoose `ObjectId` references. Reviews independently reference their author.

Mongoose population reconstructs these relationships when retrieving data:

```js
Campground.findById(id)
    .populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
    .populate('author');
```
This allows the application to retrieve a campground together with its author, reviews, and review authors while maintaining those entities as separate MongoDB documents.

### Referential Cleanup
 When a campground is deleted, Mongoose document middleware removes its associated reviews:

 ```text
 Campground deletion
        │
        ▼
findOneAndDelete()
        │
        ▼
Mongoose post middleware
        │
        ▼
Collect referenced Review IDs
        │
        ▼
Review.deleteMany(...)
```
This prevents deleted campgrounds from intentionally leaving their references review documents behind.

## Cloud Image Upload Pipeline

Campground images are stored externally using **Cloudinary**, while MongoDB stores only the metadata required to reference those assets.

The application uses **Multer memory storage** to process incoming `multipart/form-data`. Uploaded files are temporarily represented as memory buffers and forwarded to Cloudinary through its streaming upload API.

```text
Browser
   │
   │ multipart/form-data
   ▼
Express Route
   │
   ▼
Multer
memoryStorage()
   │
   │ file.buffer
   ▼
Custom uploadImage()
   │
   ▼
Cloudinary
upload_stream()
   │
   ├── secure_url
   └── public_id
          │
          ▼
     Mongoose Model
          │
          ▼
      MongoDB Atlas
```

Multiple uploads are processed asynchronously using `Promise.all()`:
```js
const uploadResults = await Promise.all(
    req.files.map(file => uploadImage(file.buffer))
);
```
Cloudinary responses are tranformed into application-level image metadata:
```js
{
    url: result.secure_url,
    filename: result.public_id
}
```
Upload limits constrain both individual file size and the number of files accepted by a request.

### Dynamic Image Transformation

The mongoose image schema exposes a virtual `thumbnail` property that derices a transformed Cloudinary URL without storing an additional database fiels.

This keeps transformed image URLs as computed application data rather than duplicating them in MongoDB.

```js
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// 'this' refers to the particular image
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
    ...,
    images: [ImageSchema],
    ...
});
```

The conceptual architecture is:
```text
Original Cloudinary URL
          │
          ▼
Mongoose Virtual('thumbnail')
          │
          ▼
Cloudinary Transformation URL
          │
          ▼
Optimized Thumbnail
```

## Geospatial Features & MapBox Integration
YelpCamp integrates **MapBox** for geocoding and interactive geographic visualization.

When a campground is created, its human-readable location is submitted to the Mapbox Geocoding API. The resulting longitue and latitude are persisted as a GeoJSON `Point` within the campground document.

```text
"Yosemite Valley, California"
              │
              ▼
      Mapbox Geocoding API
              │
              ▼
     longitude / latitude
              │
              ▼
        GeoJSON Point
              │
              ▼
        MongoDB Atlas
```
The stored coordinates are subsequently consumed by Mapbox GL JS on the frontend.

Two map experiences are provided:
- **Campground detail map** - Displays the selected campground using its persisted geographic coordinates.
- **Cluster Map** - Visualizes multiple campgrounds using a `GeoJSON` source and synamically groups nearby markers in interactive clusters. 

Location strings are converted into structured geographic data on the backend and rendered interactively by the browser.

Backend:
```text

"Denver, Colorado"
       ↓
Geocoding
       ↓
[-104.99, 39.73]
```
Frontend:
```text

[-104.99, 39.73]
       ↓
Mapbox GL
       ↓
Visual marker
```

## Validation & Security

YelpCamp applies multiple defensive controls across the HTTP request lifecycle rather than relying on a single security mechanism.

### Server-Side Validation

Campground and review payloads are validated with **Joi** before controller and database operations are executed.

Validation includes required fields, numeric constraints, rating boundaries, and a custom `escapeHTML()` Joi extension that rejects HTML-containing input.

```text
Incoming Request
       │
       ▼
Joi Schema
       │
       ├── Required fields
       ├── Type validation
       ├── Numeric constraints
       └── HTML-content validation
               │
               ▼
          Controller
               │
               ▼
           Mongoose
```
### Security Controls

The application additionally implements:

- **Helmet** - For security-related HTTP response headers.
- **Content Security Policy(CSP)** - With explicity permitted origins required by services such as MapBox and Cloudinary.
- **HTML Sanitization** - Through `sanitize-html`.
- **MongoDB Query Sanitization** - To mitigate operator-injection attempts.
- **HttpOnly Session Cookies** - To restrict browser-side JavaScript access to the session cookie.
- **Authentication Middleware** - For protected routes.
- **Ownership-based authorization** -  For campground and review modification.
- **Server-side Joi Validation** - Before persistence.

### Express 5 Query Sanitization Compatibility

### Express 5 Query Sanitization Compatibility
Upgrading the application to Express 5 exposed compatibility differences in middleware originally designed around earlier request-object behavior.

During dependency modernization, the MongoDB sanitization layer required
adaptation because Express 5 exposes `req.query` through a getter rather than
the freely assignable request property expected by older middleware patterns.

A custom Express 5 compatibility utility was therefore introduced around
`express-mongo-sanitize`. The adapter sanitizes incoming request data while
handling query parameters without relying on unsupported direct reassignment
of `req.query`.

This preserves MongoDB operator-injection mitigation across request bodies,
route parameters, headers, and query data while maintaining compatibility
with the upgraded Express runtime.

## Error Handling

Asynchronous route failures are forwarded into a centralized Express error-handling pipeline through a reusable `CatchAsync()`wrapper.

Custom `ExpressError` instances carry HTTP status information, while unmatched routes are converted into application-level 404 errors before reaching the shared error handler.

```text
Async Controller
      │
      │ error / rejected Promise
      ▼
catchAsync
      │
      ▼
next(error)
      │
      ▼
Central Express
Error Middleware
      │
      ▼
HTTP status + Error View
```

This avoids repetitive try/catch blocks across route handlers and provides a
consistent error-response path throughout the application.

This demonstrates an important Express concept:
```js
next(err)
```
This isn't just an arbitrary function cal- - it transfers control into the `error-handling middleware chain`.


## Engineering Challenges & Modernization

YelpCamp was originally developed as part of a structured full-stack learning
project and was later revisited to bring its architecture and dependency stack
closer to current Node.js and Express development practices.

The original image-upload architecture depended on
`multer-storage-cloudinary`, which tightly coupled Multer's storage engine to
Cloudinary.

During dependency modernization, this integration was replaced with an explicit
upload pipeline based on current Multer and Cloudinary APIs:

Legacy Integration:

```text

Multipart Request
       ↓
Multer
       ↓
multer-storage-cloudinary
       ↓
Cloudinary
```

Modernized Integration:

```text

Multipart Request
       ↓
Multer memoryStorage()
       ↓
Binary Buffer
       ↓
Custom uploadImage()
       ↓
Cloudinary upload_stream()
       ↓
secure_url + public_id
```

This separates multipart request processing from permanent cloud storage and
removes the application's dependency on the legacy Cloudinary-specific Multer
storage adapter.

Both campground creation and editing workflows use the same upload architecture,
ensuring newly uploaded images are consistently processed before their Cloudinary
metadata is persisted in MongoDB.

## Production Dependency Compatibility

Production deployment also exposed a CommonJS/ES Module compatibility conflict within the HTML sanitization dependency tree.

The application retained the patched `sanitize-html` release while constraining its transitive htmlparser2 dependenct to a compatible version through npm dependency overrides.

The resulting dependency tree preserved the application's HTML-validation
functionality while remaining compatible with the production runtime.

## Deployment Validation

Modernization was validated through local application testing, production builds, dependency auditing, and deployment through Vercel.

The final deployment integrates: 
- **Vercel** - For hosting and Git-based deployments.
- **MongoDB Atlas** - for persistent application and session data.
- **Cloudinary**- For campground image storage and transformation.
- **MapBox** - For geocoding and interactive maps.
- **GitHub** - As the version-controlled source and deployment integration.

## Project Structure

The repository separates application responsibilities across routing, controllers, persistence models, views, middleware, utilities, and external service integrations. 

```text
YelpCamp/
│
├── cloudinary/          # Cloudinary configuration and upload helpers
├── controllers/         # Request handling and application logic
├── models/              # Mongoose schemas and domain models
├── public/              # Client-side JavaScript, CSS and static assets
├── routes/              # Express route definitions
├── seeds/               # Development/seed data generation
├── utils/               # Error handling and compatibility utilities
├── views/               # EJS templates, layouts and partials
│
├── app.js               # Express application configuration
├── middleware.js        # Authentication, authorization and validation
├── schemas.js           # Joi validation schemas
├── package.json         # Dependencies and runtime configuration
└── package-lock.json    # Reproducible dependency tree
```
This structure reflects the MVC-oriented architecture while keeping
cross-cutting concerns such as validation, security middleware, cloud services,
and error handling independently maintainable

## Installation & Local Development

### Local Development Prerequisities
Before running the application locally, ensure the following are available: 

- Node.js
- npm
- A MongoDB database
- Cloudinary account and API credentials
- Mapbox access token

### Installation

Clone the repository and install its dependencies:
```bash
git clone https://github.com/ArdaKonut/Yelp-Camp-Full-Stack-Learning-Project.git

cd Yelp-Camp-Full-Stack-Learning-Project
npm install
```

Create the required environment configuration and provide the external service
credentials used by the application.

Start the application using the configured npm development/start (`node app.js`) command.

The application will connect to MongoDB and initialize the Express server using
the supplied environment configuration.

## Environment Configuration
The application relies on environment variables for database connectivity, session security, Cloudinary integration, and MapBox services.

A local `.env` configuration requires values equivalent to:
```env
DB_URL=<mongodb-connection-string>

SECRET=<session-secret>

CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_KEY=<cloudinary-api-key>
CLOUDINARY_SECRET=<cloudinary-api-secret>

MAPBOX_TOKEN=<mapbox-access-token>
```
Environment files containing real credentials are excluded from version control.
Production credentials are supplied through the deployment environment rather
than committed to the repository.

## Deployment

The production application is deployed through Vercel and connected to the
GitHub repository for source-controlled deployments.

```text
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    │ deployment integration
    ▼
Vercel
    │
    ├────────────► MongoDB Atlas
    │               Application Data
    │               Persistent Sessions
    │
    ├────────────► Cloudinary
    │               Image Storage
    │
    └────────────► Mapbox
                    Geocoding
                    Map Visualization
```
Application secrets and external-service credentials are supplied through the
production environment rather than being stored in source control.


## Future Improvements

The current application provides the complete core campground and review
workflow. Potential extensions include:

- **Automated Testing** — Introduce unit and integration tests for controllers,
  middleware, authentication, authorization, and major CRUD workflows.
- **Upload Validation** — Add explicit MIME-type validation to the Multer upload
  pipeline in addition to existing file-size and file-count limits.
- **Session Hardening** — Further refine production cookie policies and session
  lifecycle configuration.
- **Observability** — Introduce structured application logging and production
  error monitoring for improved operational visibility.