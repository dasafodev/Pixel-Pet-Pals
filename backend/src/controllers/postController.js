const Post = require('../models/Post');
const User = require('../models/User'); // To populate user details
const fs = require('fs');
const path = require('path');
// Note: Multer instance is now in middleware/upload.js, so it's not directly needed here
// unless for specific error handling related to multer itself.

// Helper function to transform image URLs to absolute paths
const transformPostData = (postData, backendUrl) => {
    if (!backendUrl) return postData; // Safety check

    // Ensure postData is a plain object for modification
    const transformedData = postData.toObject ? postData.toObject() : { ...postData };

    // Transform post.imageUrls
    if (transformedData.imageUrls && Array.isArray(transformedData.imageUrls)) {
        transformedData.imageUrls = transformedData.imageUrls.map(url =>
            url && !url.startsWith('http') ? `${backendUrl}${url}` : url
        );
    }

    // Transform user avatar and petAvatar in post.user
    if (transformedData.user) {
        if (transformedData.user.avatar && !transformedData.user.avatar.startsWith('http')) {
            transformedData.user.avatar = `${backendUrl}${transformedData.user.avatar}`;
        }
        if (transformedData.user.petAvatar && !transformedData.user.petAvatar.startsWith('http')) {
            transformedData.user.petAvatar = `${backendUrl}${transformedData.user.petAvatar}`;
        }
    }

    // Transform avatars in post.comments[].user
    if (transformedData.comments && Array.isArray(transformedData.comments)) {
        transformedData.comments = transformedData.comments.map(comment => {
            if (comment.user) {
                if (comment.user.avatar && !comment.user.avatar.startsWith('http')) {
                    comment.user.avatar = `${backendUrl}${comment.user.avatar}`;
                }
                if (comment.user.petAvatar && !comment.user.petAvatar.startsWith('http')) {
                    comment.user.petAvatar = `${backendUrl}${comment.user.petAvatar}`;
                }
            }
            return comment;
        });
    }
    
    // Transform avatars in post.likes[] (if populated user objects)
    if (transformedData.likes && Array.isArray(transformedData.likes)) {
        transformedData.likes = transformedData.likes.map(like => {
            // Check if 'like' is a populated user object
            if (like && typeof like === 'object' && like._id) { 
                if (like.avatar && !like.avatar.startsWith('http')) {
                    like.avatar = `${backendUrl}${like.avatar}`;
                }
                if (like.petAvatar && !like.petAvatar.startsWith('http')) {
                    like.petAvatar = `${backendUrl}${like.petAvatar}`;
                }
            }
            return like;
        });
    }

    return transformedData;
};

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content && (!req.files || req.files.length === 0)) { // Content or images must be present
            return res.status(400).json({ message: 'Post content or images cannot be empty.' });
        }

        const imageUrls = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                // Construct the URL path for each image
                imageUrls.push(`/uploads/posts/${file.filename}`);
            });
        }

        const newPostData = {
            user: req.user.id, // Assuming req.user is populated by auth middleware
            content: content || "", // Allow empty content if images are present
            imageUrls: imageUrls,
        };

        const post = new Post(newPostData);
        await post.save();
        
        // Populate user details for the created post
        let populatedPost = await Post.findById(post._id)
            .populate('user', 'username avatar petAvatar') 
            .populate('comments.user', 'username avatar petAvatar');
        
        // Transform image URLs before sending the response
        const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
        res.status(201).json(transformedPopulatedPost);

    } catch (error) {
        // If post creation fails after image upload, attempt to delete uploaded files
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'posts', file.filename);
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting uploaded file after post creation failure:", err);
                });
            });
        }
        // Handle Mongoose validation errors (e.g., too many images)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

// Get all posts (with pagination and search)
exports.getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const query = {};

        if (search) {
            // Add search condition for post content (case-insensitive)
            query.content = { $regex: search, $options: 'i' };
        }

        const posts = await Post.find(query)
            .populate('user', 'username avatar petAvatar')
            .populate('comments.user', 'username avatar petAvatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1) // Convert limit to number
            .skip((page - 1) * limit) // Convert page to number
            .exec();
        
        // Get total documents for pagination
        const count = await Post.countDocuments(query);

        const transformedPosts = posts.map(post => transformPostData(post, process.env.BACKEND_URL));

        res.status(200).json({
            posts: transformedPosts,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalPosts: count
        });
    } catch (error) {
        console.error("Error in getAllPosts:", error); // Added console.error for better debugging
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

// Get all posts by a specific user
exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const posts = await Post.find({ user: userId })
            .populate('user', 'username avatar petAvatar') // Added petAvatar
            .populate('comments.user', 'username avatar petAvatar') // Added petAvatar
            .sort({ createdAt: -1 });
        
        if (!posts) {
            // Send empty array if no posts, or handle as preferred
            return res.status(200).json([]); 
        }
        
        const transformedPosts = posts.map(post => transformPostData(post, process.env.BACKEND_URL));
        res.status(200).json(transformedPosts);
    } catch (error) {
        console.error("Error in getUserPosts:", error); // Added console.error
        res.status(500).json({ message: 'Error fetching user posts', error: error.message });
    }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('user', 'username avatar petAvatar') // Added petAvatar
            .populate('comments.user', 'username avatar petAvatar'); // Added petAvatar
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const transformedPost = transformPostData(post, process.env.BACKEND_URL);
        res.status(200).json(transformedPost);
    } catch (error) {
        console.error("Error in getPostById:", error); // Added console.error
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the logged-in user is the author of the post
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to update this post' });
        }

        if (content) post.content = content;
        // Image update logic can be added here if needed (delete old, upload new)
        // For simplicity, current updatePost does not handle image changes.
        // A more complex implementation would involve checking for new req.files,
        // deleting old images from post.imageUrls, and adding new ones.

        post.updatedAt = Date.now(); // Handled by timestamps: true in schema
        await post.save();
        let populatedPost = await Post.findById(post._id)
            .populate('user', 'username avatar petAvatar') 
            .populate('comments.user', 'username avatar petAvatar');
        
        const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
        res.status(200).json(transformedPopulatedPost);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this post' });
        }

        // If post has images, delete them from the server
        if (post.imageUrls && post.imageUrls.length > 0) {
            post.imageUrls.forEach(imageUrl => {
                const imagePath = path.join(__dirname, '../../public', imageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlink(imagePath, (err) => {
                        if (err) console.error("Error deleting post image:", err);
                    });
                }
            });
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};

// Like/Unlike a post
exports.toggleLikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user.id;
        const likeIndex = post.likes.findIndex(likeId => likeId.toString() === userId);

        if (likeIndex > -1) {
            // User has already liked, so unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // User has not liked, so like
            post.likes.push(userId);
        }

        await post.save();
        let populatedPost = await Post.findById(post._id)
            .populate('user', 'username avatar petAvatar') 
            .populate('likes', 'username avatar petAvatar') 
            .populate('comments.user', 'username avatar petAvatar');
            
        const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
        res.status(200).json(transformedPopulatedPost);
    } catch (error) {
        console.error("Error in toggleLikePost:", error); // Added console.error
        res.status(500).json({ message: 'Error toggling like on post', error: error.message });
    }
};

// Add a comment to a post
exports.addCommentToPost = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Comment text cannot be empty.' });
        }

        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            user: req.user.id,
            text: text,
        };

        post.comments.push(newComment);
        await post.save();
        
        // Populate the newly added comment and the post
        const populatedPost = await Post.findById(post._id)
            .populate('user', 'username avatar petAvatar') // Added petAvatar
            .populate('likes', 'username avatar petAvatar') // Added petAvatar
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username avatar petAvatar' 
                }
            });
        
        const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
        res.status(201).json(transformedPopulatedPost);
    } catch (error) {
        console.error("Error in addCommentToPost:", error); // Added console.error
        res.status(500).json({ message: 'Error adding comment to post', error: error.message });
    }
};

// Delete a comment from a post
exports.deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the logged-in user is the author of the comment or the author of the post
        if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this comment' });
        }
        
        // Mongoose subdocument removal
        comment.deleteOne(); // or post.comments.pull(commentId) and then post.save()
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('user', 'username avatar petAvatar') // Added petAvatar
            .populate('likes', 'username avatar petAvatar') // Added petAvatar
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username avatar petAvatar' // Added petAvatar
                }
            });
        
        const transformedPopulatedPost = transformPostData(populatedPost, process.env.BACKEND_URL);
        res.status(200).json(transformedPopulatedPost);
    } catch (error) {
        console.error("Error in deleteComment:", error); // Added console.error
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};
