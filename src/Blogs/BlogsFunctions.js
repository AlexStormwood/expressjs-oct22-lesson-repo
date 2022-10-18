const {Post} = require('../database/schemas/PostsSchema');

// Model.find() with no conditions inside "find()" will return all documents of that Model
async function getAllPosts(){
    let allPosts = await Post.find();
    // allPosts.foreach()

    return JSON.stringify(allPosts);
}

// The ".exec()" helps the query just run instead of saving it for re-use.
async function getSpecificPost(postID){
    let specificPostQuery = await Post.findById(postID).exec();
    return specificPostQuery;
}

// New Post instance needs to be specifically saved for it to be stored in the database.
async function createSpecificPost(postDetails){
    let newPost = new Post({
        postTitle: postDetails.postTitle,
        postContent: postDetails.postContent,
        postAuthorID: postDetails.postAuthorID
    })
    // extra logic on the newPost before saving
    // then save
    let creationResult = await newPost.save();
    return creationResult;
}

// Theoretically, you could use this instead of "new Post({})" thanks to upsert.
async function updateSpecificPost(postDetails){
    try {
        let updateResult = await Post.findByIdAndUpdate(
            {_id: postDetails.postID},
            {
                postTitle: postDetails.postTitle,
                postContent: postDetails.postContent,
                postAuthorID: postDetails.postAuthorID
            },
            { 
                upsert: true, // upsert means it'll create document if it doesn't exist
                new: true // return the new modified doc. if false, original is returned.
            } 
        );
    
        return updateResult;
    } 
    catch (error) {
        if (error.name == "CastError") {
            return {
                errorCode: "Document not found"
            }
        } else {
            return {
                error: error,
                errorCode:"Failed to update document"
            }
        }

    }

    
}

// Returns an empty object if all goes well.
async function deleteSpecificPost(postID){
    let deletionResult = await Post.deleteOne({ _id: postID});
    // returns 1 if deleted 1 document
    // returns 0 if deleted 0 documents
    // should never return more than 1
    return deletionResult;
}

module.exports = {
    getAllPosts, getSpecificPost, createSpecificPost, updateSpecificPost, deleteSpecificPost
}