import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as postController from '../controllers/ts/PostController.js';
import { protect } from '../middleware/auth.js';
import uploadPostImages from '../middleware/upload.js';

const router = express.Router();

// @route   POST api/posts
// @desc    Create a new post
// @access  Private
const handleUploadErrors = (req: Request, res: Response, next: NextFunction): void => {
  uploadPostImages(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({ message: 'Too many files. Maximum is 9 images.' });
        return;
      }
      res.status(400).json({ message: err.message });
      return;
    } else if (err) {
      // An unknown error occurred when uploading.
      res.status(400).json({ message: err }); // err from fileFilter is a string
      return;
    }
    // Everything went fine.
    next();
  });
};

router.post('/', protect, handleUploadErrors, postController.createPost);

// @route   GET api/posts
// @desc    Get all posts (with optional search query)
// @access  Public (or Private, depending on your app's requirements)
router.get('/', postController.getAllPosts); // Handles both all posts and search

// @route   GET api/posts/:postId
// @desc    Get a single post by ID
// @access  Public (or Private)
router.get('/:postId', postController.getPostById); // Add authMiddleware if needed.

// @route   GET api/posts/user/:userId
// @desc    Get all posts by a specific user
// @access  Public (or Private, depending on requirements)
router.get('/user/:userId', postController.getUserPosts); // Add authMiddleware if needed

// @route   PUT api/posts/:postId
// @desc    Update a post
// @access  Private
router.put('/:postId', protect, postController.updatePost); // Image update could be handled here or a separate route

// @route   DELETE api/posts/:postId
// @desc    Delete a post
// @access  Private
router.delete('/:postId', protect, postController.deletePost);

// @route   POST api/posts/:postId/like
// @desc    Like or unlike a post
// @access  Private
router.post('/:postId/like', protect, postController.toggleLikePost);

// @route   POST api/posts/:postId/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/:postId/comments', protect, postController.addCommentToPost);

// @route   DELETE api/posts/:postId/comments/:commentId
// @desc    Delete a comment from a post
// @access  Private
router.delete('/:postId/comments/:commentId', protect, postController.deleteComment);

export default router;