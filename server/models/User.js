const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    cpassword: {
        type: String,
        required: true
    },

    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    tokens: [
        {

            token: {
                type: String,
                required: true
            }

        }
    ]

})

userSchema.methods.generateAuthToken = async function () {

    try {

        const token = jwt.sign({ _id: this._id }, "MYNAMEISVANSHAJBAJAJANDIAMNOTATERRORIST");
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;

    }
    catch (err) {
        console.log(err);
    }

}

userSchema.pre('save', async function (next) {

    if (this.isModified('password')) {

        this.password = await bcryptjs.hash(this.password, 12);
        this.cpassword = await bcryptjs.hash(this.cpassword, 12);

    }
    next();

})

const User = mongoose.model('users', userSchema);
module.exports = User;