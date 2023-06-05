const express = require('express');
const cors = require('cors');
const router = express.Router();
var nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const requestIp = require('request-ip');
const axios = require('axios');
const ObjectId = require('mongodb').ObjectId;

require("./../config/mongoose");

const User = require("./../models/User");
const Post = require("./../models/Post");
const authenticate = require('../middleware/authenticate');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'guftagublog@gmail.com',
        pass: 'jbuqyhttcenajrwp'
    }
});

router.get('/', async function (req, res) {
    // res.send(console.log(req));
    // var clientIp = requestIp.getClientIp(req);
    // clientIp=(clientIp=="::1")?"122.173.24.53":clientIp;
    // var loc= await axios.get(`http://api.ipstack.com/${clientIp}?access_key=2f365ac1b83a66f804d1d57a13b278a2`);
    // var state=loc.data.city;
    // var mailOptions = {
    //     from: 'guftagublog@gmail.com',
    //     to: 'vanshajbajaj@gmail.com',
    //     subject: 'New Login Activity',
    //     text: `A new login activity has been detected from your account near ${state}.`
    // };

    // transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });
})

router.post('/api/register', async (req, res) => {

    console.log(req.body);

    const { name, age, email, password, cpassword } = req.body;

    if (!name || !email || !age || !password || !cpassword) {

        return res.status(401).json({ error: "Please fill all the fields!" });

    }

    try {

        const userExists = await User.findOne({ email: email });

        if (userExists) {
            return res.status(422).json({ error: "Email already exists!" });
        }
        else if (password != cpassword) {
            return res.status(422).json({ error: "Passwords should be same" });
        }
        else {

            const user = new User({ name, age, email, password, cpassword });

            const userRegister = await user.save();

            if (userRegister) {
                return res.status(201).json({ message: "user registered successfully" });
            }
            else {
                return res.status(500).json({ error: "failed to register user" })
            }

        }

    }
    catch (err) {
        console.log(err);
    }

})

router.post('/api/signin', async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "enter all fields" });
        }

        const userLogin = await User.findOne({ email: email });

        console.log(userLogin);

        if (userLogin) {
            const isMatch = await bcryptjs.compare(password, userLogin.password);

            const token = await userLogin.generateAuthToken();
            console.log(token);

            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 25892000000),
                // credentials:'include',
                httpOnly: true,
            });


            if (!isMatch) {
                return res.status(400).json({ error: "Invalid Credentials" })
            }
            else {

                var clientIp = requestIp.getClientIp(req);
                // clientIp = (clientIp == "::1") ? "122.173.24.53" : clientIp;
                axios.get(`http://api.ipstack.com/${clientIp}?access_key=2f365ac1b83a66f804d1d57a13b278a2`).then(
                    (loc) => {
                        var state = loc.data.city;
                        if (!state) {
                            state = "localHost";
                        }
                        // console.log(loc.data);
                        var mailOptions = {
                            from: 'guftagublog@gmail.com',
                            to: email,
                            subject: 'New Login Activity',
                            text: `A new login activity has been detected from your account near ${state}.`
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                    }
                )

                return res.json({ message: "logged in successfully" });

            }

        }
        else {

            return res.status(400).json({ error: "Invalid Credentials" })

        }

    }
    catch (err) {
        console.log(err);
    }

});

router.post('/api/logout', async (req, res) => {

    try {

        res.clearCookie('jwtoken');
        res.status(200).json({ message: 'Logged out successfully' });

    } catch (err) {

        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });

    }

});

router.post('/api/createpost', authenticate, async (req, res) => {
    try {
        console.log("hello");
        const { head, content, tags, image } = req.body;
        const userId = req.userID; // Get the ID of the current user from req.userID
        const userName = req.userName;

        const tagArray = tags.split(' ').map((tag) => tag.trim());

        const newPost = new Post({
            userId, // Save the current user's ID in the post
            username: userName,
            head,
            content,
            tags: tagArray,
            image
        });

        await newPost.save();

        res.status(200).json({ message: 'Post created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/api/getcurrposts', authenticate, async (req, res) => {
    try {
        console.log("in curr");
        const userId = req.userID;

        const posts = await Post.find({ userId });

        res.status(200).json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/api/deletepost/:postId', authenticate, async (req, res) => {
    try {
        const postId = req.params.postId;

        // Find the post by ID
        const post = await Post.findOneAndDelete({ _id: postId, userId: req.userID });

        if (!post) {
            return res.status(404).json({ message: 'Post not found or not authorized to delete' });
        }

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/api/getallposts', async (req, res) => {
    try {
        console.log("in all");

        const posts = await Post.find({});

        res.status(200).json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/api/search', async (req, res) => {
    try {
        const keyword = req.query.keyword;

        const posts = await Post.find({
            $or: [
                { head: { $regex: keyword, $options: 'i' } },
                { tags: { $regex: keyword, $options: 'i' } },
                { username: { $regex: keyword, $options: 'i' } },
            ],
        });

        res.status(200).json({ results: posts });

    } catch (error) {
        console.error('Failed to perform search', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

router.get('/api/posts/followed', authenticate, async (req, res) => {
    try {

        const currentUser = req.rootUser;

        const followedUsers = currentUser.following;

        const posts = await Post.find({ userId: { $in: followedUsers } });

        res.status(200).json({ posts });
    } catch (error) {
        console.error('Failed to get posts of followed users', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/api/postdetails/:id', authenticate, async (req, res) => {

    try {

        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const currentUserId = req.userID;

        const currentUserLiked = post.likes.some((like) => like.userId.equals(currentUserId));

        const postOwner = await User.findById(post.userId);
        const currentUserFollows = postOwner.followers.some((follower) => follower.equals(currentUserId));

        console.log(currentUserLiked + ' ' + currentUserFollows);

        res.status(200).json({ post, currentUserLiked, currentUserFollows });

    }
    catch (error) {

        console.error('Failed to fetch post', error);
        res.status(500).json({ error: 'Failed to fetch post' });

    }

});

router.post('/api/addcomment', authenticate, async (req, res) => {

    try {
        const { postId, comment } = req.body;
        const currentUserId = req.userID;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const newComment = {
            userId: currentUserId,
            username: req.userName,
            content: comment,
        };

        post.comments.push(newComment);

        await post.save();

        const powner = await User.findById(post.userId);

        var mailOptions = {
            from: 'guftagublog@gmail.com',
            to: powner.email,
            subject: `${req.userName} commented on your post`,
            text: `${req.userName} commented on your post!. Go check it out`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({
            userId: currentUserId,
            username: req.userName,
            content: comment,
        });

    } catch (error) {
        console.error('Failed to add comment', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.post('/api/likepost', authenticate, async (req, res) => {
    try {
        const { id } = req.body;
        const currentUserId = req.userID;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const newLike = {
            userId: currentUserId,
            username: req.userName,
        };

        post.likes.push(newLike);

        await post.save();

        const powner = await User.findById(post.userId);

        var mailOptions = {
            from: 'guftagublog@gmail.com',
            to: powner.email,
            subject: `${req.userName} liked your post`,
            text: `${req.userName} liked your post!. Go check it out`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ message: 'Post liked successfully', likedPost: newLike });

    } catch (error) {
        console.error('Failed to like post', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/api/follow/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.rootUser;

        currentUser.following.push(userId);

        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        targetUser.followers.push(currentUser._id);

        await targetUser.save();
        await currentUser.save();

        var mailOptions = {
            from: 'guftagublog@gmail.com',
            to: targetUser.email,
            subject: `${req.userName} started following you!`,
            text: `${req.userName} started following you!. Go check it out`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ message: 'User followed successfully' });

    } catch (error) {
        console.error('Failed to follow user', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




module.exports = router;