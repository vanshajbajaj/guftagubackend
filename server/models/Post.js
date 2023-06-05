const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    username: {
        type: String,
        required: true,
    },

    head: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: false,
        default: "default.png",
    },

    tags: {
        type: [String],
        required: true
    },

    likes: [{

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        username: {
            type: String,
            required: true,
        },

    }],

    comments: [{

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        username: {
            type: String,
            required: true,
        },

        content: {
            type: String,
            required: true
        }

    }]

});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
