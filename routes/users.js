const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/nayaappforgolus");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    dp: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);