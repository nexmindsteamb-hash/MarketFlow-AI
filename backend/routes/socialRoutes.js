const express = require("express");
const router = express.Router();

let posts = [];

// Create Post
router.post("/posts", (req, res) => {
    const { platform, caption, imageUrl } = req.body;

    if (!platform || !caption) {
        return res.status(400).json({
            success: false,
            message: "Platform and caption are required"
        });
    }

    const newPost = {
        id: Date.now(),
        platform,
        caption,
        imageUrl: imageUrl || null,
        status: "Draft",
        createdAt: new Date()
    };

    posts.push(newPost);

    res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: newPost
    });
});

// Get All Posts
router.get("/posts", (req, res) => {
    res.status(200).json({
        success: true,
        data: posts
    });
});

module.exports = router;
