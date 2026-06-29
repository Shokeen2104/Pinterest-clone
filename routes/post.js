const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    postText: {
        type: String,
        required: true,
        trim: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    image: {
        type: String,
        default: ""
    },
    tags: [{
        type: String
    }],
    likes: {
        type: Array,
        default: [],
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Post", postSchema);