const mongoose = require('mongoose');

// Schema to structure the data
const PostSchema = new mongoose.Schema({
    postTitle: String,
    postContent: String,
    postAuthorID: String
});

PostSchema.methods.getAuthorName = async function getAuthorName() {
    /*
    let author = AuthorSchema.findById(this.postAuthorID)
    */
   console.log(`Use the auth system to search for a user, something like FirebaseAuth.findUser(postAuthorID) using the data value from ${this.postAuthorID}`)
}

// Class / model to help make instances of that schema
const Post = mongoose.model('Post', PostSchema);

module.exports = {Post}