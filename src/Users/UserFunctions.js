// Firebase Admin SDK was initialized elsewhere, we just need access to its functions.
const firebaseAdmin = require('firebase-admin');

// Set up the Firebase Client SDK
const {firebaseConfig} = require('../../keys/firebaseClientKey');
const firebaseClient = require("firebase/app");
// Add the Firebase products that you want to use
const {getAuth, signInWithEmailAndPassword} = require ("firebase/auth");
// Initialize the Firebase Client SDK
firebaseClient.initializeApp(firebaseConfig);

// ----------- Config above
// Functions below
/*
 userDetails = {
    username: "olahabsa",
    email:"whaogihjadsg",
    password:'caosjncalkcna'
 }

*/
async function signUpUser(userDetails){
    // Use the Firebase Admin SDK to create the user
    // if (userDetails.email.contains(someBannedDomain)) {
    // return ({
    //    error: "Banned email domain"
    // })
    //}


    return firebaseAdmin.auth().createUser({
        email: userDetails.email, // User email address.
        emailVerified: true, // Required for fuller user functionality, but a hassle to set up in a short tutorial. Set to false if you do end up configuring email verifications, as the email system will set it to true.
        password: userDetails.password, // password. You'll never see this value even as project admin.
        displayName: userDetails.displayName, // the username
        // photoURL: "", // point to an image file hosted elsewhere
        disabled: false // if a user is banned/usable
    }).then( async (userRecord) => {
        console.log(`\n Raw userRecord is ${JSON.stringify(userRecord)} \n`);
        
        // Set "Custom Claims" on the new user
        let defaultUserClaims = firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, {regularUser: true}).then(() => {
            console.log("Set a regularUser claim to the new user! They must log in again to get the new access.");
            // You can do things like detect values in the email address (eg. if the new user email is the project admin email) and set the claim object to include other values.
            // Claims allow you to handle authorization without ever giving the client any data that they could hack or manipulate.
            // Of course, you can still pass the claims along to the client if you want to (eg. for front-end authorization to hide content), just know that front-end authorization isn't bulletproof.

        });

        return userRecord;
        
    }).catch(error => {
        console.log("Internal sign-up function error is: \n" + error);
        return {error:error};
    });
}

async function signInUser(userDetails){
    // Firebase client SDK splits out getAuth to its own thing,
    // and it makes an instance of an Auth management object
    const firebaseClientAuth = getAuth();

    // signInWithEmailAndPassword is a Firebase Auth function,
    // so signing in with other methods need different Firebase Auth functions
    // Either way, needs a Firebase Auth client instance AND the sign-in details
    let signInResult = signInWithEmailAndPassword(firebaseClientAuth, userDetails.email, userDetails.password)
    .then(async (userCredential) => {

        // Note the `async (userCredential) => {}` above
        // This function is async, so we can use await instead of nesting promises
        let userIdToken = await firebaseClientAuth.currentUser.getIdTokenResult(false);

        // Sanity-checking to make sure we got the right data from Firebase
        console.log(`userIdToken obj is\n ${JSON.stringify(userIdToken)}`);

        // Here, you could do whatever you want based on the user data that Firebase returned
        // This return below simply returns a custom object.
        // Because some data is in the userIdToken and some data is in the userCredential.
        return {
            idToken: userIdToken.token,
            refreshToken: userCredential.user.refreshToken,
            email: userCredential.user.email,
            emailVerified: userCredential.user.emailVerified,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            uid: userCredential.user.uid
        }
    }).catch(error => {
        // If things break, Firebase provides a real descriptive error.
        // Log the error, then return the error.

        // switch (error.code) {
        //     case "auth/invalid-email":
                
        //         break;
        //     case "auth/invalid-pasqsword":
            
        //         break;
        
        //     default:
        //         break;
        // }

        // if (error.code == 'auth/invalid-email') {
        //     // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
        //     console.log("Your email was invalid, try again! Full error is: \n" + error);
        // } else {
        //     // Token is invalid.
        //     console.log("Session token is invalid. Full error is: \n" + error);
        // }


        console.log("Internal signin function error is: \n" + error);
        return {error:error};
    });

    // This will be either an error object, or a user data object.
    return signInResult;
}

async function validateUserSession(sessionDetails){
    let userRefreshToken = sessionDetails.refreshToken;
    let userIdToken = sessionDetails.idToken;

    // Firebase Admin SDK handles JWT verification & refreshing of tokens.
    // The "userIdToken, true" bit is basically 
    // "here is the user, check if they've been banned before checking if they're still logged in"
    return firebaseAdmin.auth().verifyIdToken(userIdToken, true).then(async (decodedToken) => {

        // Sanity check :) 
        console.log(`Decoded session token is ${JSON.stringify(decodedToken)}`);

        // Return whether or not the user has a valid session & token
        return {
            isValid: true,
            uid: decodedToken.uid,
            fullDecodedToken: decodedToken
        }

    }).catch((error) => {
        // You can specifically check for different errors based on this list:
        // https://firebase.google.com/docs/auth/admin/errors 
        if (error.code == 'auth/id-token-revoked') {
            // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
            console.log("You must sign in again to access this. Full error is: \n" + error);
        } else {
            // Token is invalid.
            console.log("Session token is invalid. Full error is: \n" + error);
        }
          
        return {error:error};
    });
}


module.exports = {
    signUpUser, signInUser, validateUserSession
}