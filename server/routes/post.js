const express = require("express");
const router = express.Router();
const postController = require("../controllers/post");
const auth = require("../auth"); 

// ^ This is a hypothetical JWT middleware that sets req.user 
//   if the token is valid. Implement as needed.

// CREATE POST (requires login)
router.post("/", auth, postController.createPost);

// GET ALL POSTS (public)
router.get("/", postController.getAllPosts);

// GET SINGLE POST (public)
router.get("/:id", postController.getSinglePost);

// UPDATE POST (requires login; must be author or admin)
router.patch("/:id", auth, postController.updatePost);

// DELETE POST (requires login; must be author or admin)
router.delete("/:id", auth, postController.deletePost);

module.exports = router;
