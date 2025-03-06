const Post = require("../models/Post");

// CREATE POST: POST /posts
module.exports.createPost = async (req, res) => {
  try {
    // `req.user` should contain the logged-in user's info if using JWT middleware
    // e.g. req.user = { userId: '...', role: 'user' }
    const { title, content } = req.body;
    const userId = req.user.userId;

    const newPost = new Post({
      title,
      content,
      author: userId
    });
    const savedPost = await newPost.save();
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: savedPost
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL POSTS: GET /posts
module.exports.getAllPosts = async (req, res) => {
  try {
    // Populate author field if you want user details
    const posts = await Post.find({}).populate("author", "username email");
    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE POST: GET /posts/:id
module.exports.getSinglePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate("author", "username email");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE POST: PATCH /posts/:id
module.exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    // Only author (or admin) can update
    // Check if the user is either the post owner or admin
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // If not admin, ensure user is the author
    if (req.user.role !== "admin" && post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    const { title, content } = req.body;
    post.title = title ?? post.title;
    post.content = content ?? post.content;
    const updatedPost = await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE POST: DELETE /posts/:id
module.exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Admin can delete any post; user can only delete their own
    if (req.user.role !== "admin" && post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
