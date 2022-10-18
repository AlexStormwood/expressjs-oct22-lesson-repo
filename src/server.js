const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');

// Set values for the server's address
const PORT = process.env.PORT || 0;
const HOST = '0.0.0.0';

// Cool trick for when promises or other complex callstack things are crashing & breaking:
void process.on('unhandledRejection', (reason, p) => {
	console.log(`Things got pretty major here! Big error:\n`+ p);
	console.log(`That error happened because of:\n` + reason);
});

// Configure server security, based on documentation outlined here:
// https://www.npmjs.com/package/helmet
// TLDR: Very niche things from older days of the web can still be used to hack APIs
// but we can block most things with these settings.
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.contentSecurityPolicy({
	directives:{
		defaultSrc:["'self'"]
	}
}));

// Configure API data receiving & sending
// Assume we always receive and send JSON
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Configure CORS, add domains to the origin array as needed.
// This is basically where you need to know what your ReactJS app is hosted on.
// eg. React app at localhost:3000 and deployedApp.com can communicate to this API, 
// but a React app at localhost:3001 or SomeRandomWebsite.com can NOT communicate to this API. 
var corsOptions = {
	origin: ["http://localhost:3000", "https://deployedApp.com"],
	optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

require('dotenv').config();

// console.log("Firebase project ID is: " + process.env.FIREBASE_ADMIN_PROJECT_ID)

const firebaseAdmin = require('firebase-admin');
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
        "projectId": process.env.FIREBASE_ADMIN_PROJECT_ID,
        "privateKey": process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "clientEmail":process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    })
});


const {databaseConnector} = require('./database');

if (process.env.NODE_ENV != "test") {
	const DATABASE_URI = process.env.DATABASE_URI || "mongodb://localhost:27017/ExpressLessonOctLocal";
	databaseConnector(DATABASE_URI).then(() => {
		// if database connection succeeded, log a nice success message 
		console.log("Database connected, woohoo!");
	}).catch(error => {
		// if database connection failed, log the error
		console.log(`
		Some error occured, it was: 
		${error}
		`)
	});
} 

// if (process.env.NODE_ENV == "test") {

// } else if (process.env.NODE_ENV == "development") {


// } else {

// }


// ----------------------------------------------------- 
// Config above
// Routes below

// Actual server behaviour
app.get('/', (req, res) => {
	console.log('ExpressJS API homepage received a request.');
  
	const target = process.env.NODE_ENV || 'not yet set';


	res.json({
        'message':`Hello ${target} world, woohoo!!`
    });

});

// Any router must be "mounted" on to the app
// So, we must import the routers and
// tell the app to use those routers on a specific label
const importedBlogRouting = require('./Blogs/BlogsRoutes');
app.use('/blogs', importedBlogRouting);
//  localhost:55000/blogs/12314

const importedUserRouting = require('./Users/UserRoutes');
app.use('/users', importedUserRouting);


// Notice that we're not calling app.listen() anywhere in here.
// This file contains just the setup/config of the server,
// so that the server can be used more-simply for things like Jest testing.
// Because everything is bundled into app, 
// we can export that and a few other important variables.
module.exports = {
	app, PORT, HOST
}