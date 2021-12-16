var express = require('express');
const mongoose = require("mongoose");
var router = express.Router();
const Useracc = require("../models/UserAccount");
const codepost = require("../models/Codepost");
const {body, validationResult} = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Codepost = require('../models/Codepost');
const validateToken =require("../auth/validateToken");

// Source lecture video 14 "Authentication and authorization"
//Validate registeration object body
router.get("/validate", validateToken, (req, res, next) => {
    return res.json({success: true})
})

//This is obviously hazardous and should not be done in production, this is only for demonstration purpouses.
router.post("/admin/create", (req, res, next) => {
    Useracc.findOne({username: "admin"}, (err, user) => {
        if(user) {
            return res.status(403).json({success: false});
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash("12345", salt, (err, hash) => {
                    if(err) throw err;
                    Useracc.create(
                    {
                        admin: true,
                        username: "admin",
                        email: "admin@mycodeborke.com",
                        password: hash
                    },
                    (err, ok) => {
                        if(err) throw err;
                        return res.status(302).json({success: true});
                    }
                    )
                })
            })
        }
    })
})

router.post("/register",
    body("username").isLength({min: 3}).trim().escape(),
    body("password").isLength({min: 5}),
    body("email").isLength({min: 5}).trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        } 
        //if no errors presist, check if database includes username. if not -> continue registeration

        Useracc.findOne({username: req.body.username}, (err, user) => {
            if(err) throw err;
            if(user){
                return res.status(403).json({success: false});
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if(err) throw err;
                        Useracc.create(
                        {
                            admin: false,
                            username: req.body.username,
                            email: req.body.email,
                            password: hash
                        },
                        (err, ok) => {
                            if(err) throw err;
                            return res.status(302).json({success: true});
                        }
                        )
                    })
                })
            }
        })
    })



router.post("/login", (req, res, next) => {
    Useracc.findOne({$or: [
        {username: req.body.username},
        {email: req.body.username}
    ]}, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.status(403).json({success: false, message: "login failed"})
        } else {
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if(err) throw err;
                if(isMatch){
                    const jwtPayload = {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }
                    jwt.sign(
                        jwtPayload,
                        process.env.SECRET,
                        {
                            expiresIn: 1200
                        },
                        (err, token) => {
                            if(err) throw err;
                            return res.json({success: true, message:"login success", token: token});
                        }
                    );
                    
                } else {
                    return res.status(404).json({success: false, message:"Invalid password or username/email"})
                }
            })
        }
    })
})

//pushes a new item into "UserAccount" Model's property upvoted
router.post("/userdetails/voted/push", (req, res, next) => {
    Useracc.findOne({_id: req.body.uid}, (err,user) => {
        if(err) throw err;
        if(!user){
            return res.status(403).json({success: false, message: "No user found"});
        } else {
            //parameter to be changed is controlled by body.toUpvote -> if true handle upvotes, else downvotes
            if(req.body.toUpvote){
                Useracc.updateOne({_id: req.body.uid}, {$push: {upvoted: req.body.postid}}).exec()
                return res.json({success: true, message: "Pushed vote to upvoted"})
            } else {
                Useracc.updateOne({_id: req.body.uid}, {$push: {downvoted: req.body.postid}}).exec()
                return res.json({success: true, message: "Pushed vote to downvoted"})
            }
            
        }
    })
})

//deleted post ids remain -> make sure to "flush" 
router.post("/userdetails/voted/pull", (req, res, next) => {
    Useracc.findOne({_id: req.body.uid}, (err,user) => {
        if(err) throw err;
        if(!user){
            return res.status(403).json({success: false, message: "No user found"});
        } else {
            if(req.body.toUpvote){
                Useracc.updateOne({_id: req.body.uid}, {$pull: {upvoted: req.body.postid}}).exec()
                return res.json({success: true, message: "Pulled vote from upvoted"})
            }else {
                Useracc.updateOne({_id: req.body.uid}, {$pull: {downvoted: req.body.postid}}).exec()
                return res.json({success: true, message: "Pulled vote from downvoted"})
            }
            
        }
    })
})

// return low to none risk userdetails of user with specific id
router.get("/userdetails/:id", (req, res, next) => {
    Useracc.findOne({_id: req.params.id} , (err, user) => {
        if(err) throw err;
        if(!user){
            return res.status(403).json({success: false, message: "No user found"});
        } else {
            return res.json({success: true, id: user._id, username: user.username, email: user.email, admin: user.admin, upvoted: user.upvoted, downvoted: user.downvoted});
        }
    })
})

router.post("/post/update", (req, res, next) => {
    Codepost.findOne({_id: req.body.id} , (err, cpost) => {
        if(err) throw err;
        if(!cpost){
            return res.status(403).json({success: false, message: "Post doesn't exists"});
        } else {
            Codepost.updateOne(
                {_id: req.body.id},
                {$set: 
                    {
                        poster: req.body.poster,
                        title: req.body.title,
                        description: req.body.desc,
                        code: req.body.code,
                        language: req.body.language,
                        postdate: Date.now()
                    }
                },
                (err, ok) => {
                    if(err) throw err;
                    return res.status(302).json({success: true, message: "Post succesfully updated!"});
                }
            )
        }
    })
})

router.post("/post/remove", (req, res, next) => {
    Codepost.findOne({_id: req.body.id}, (err, cpost) => {
        if(err) throw err;
        if(!cpost){
            return res.status(403).json({success: false, message: "Post doesn't exist"});
        } else {
            Codepost.remove(
                {_id: req.body.id},
                (err, ok) => {
                    if(err) throw err;
                    return res.status(302).json({success: true, message: "Post succesfully removed!"});
                }
            )
        }
    })
})


router.post("/post/add", validateToken, (req, res, next) => {
    Codepost.findOne({title: req.body.title}, (err, cpost) => {
        if(err) throw err;
        if(cpost){
            return res.status(403).json({success: false, message: "Post by the title exists"});
        } else {
            Codepost.create(
                {
                    poster: req.body.poster,
                    title: req.body.title,
                    description: req.body.desc,
                    code: req.body.code,
                    language: req.body.lang,
                    votes: 0,
                    postdate: Date.now()
                },
                (err, ok) => {
                    if(err) throw err;
                    return res.status(302).json({success: true, message: "Post succesfully posted!"});
                }
            )
        }
    })
})

//Returns json list of all posts
router.get("/post/list", (req, res, next) => {
    Codepost.find({}, (err, cposts) => {
        if(err) return next(err);
        return res.json(cposts);
    })
})

//Validatable
//Only admin or the comment poster can remove comments
//reqs:
/*
- User id
- post id
- comment id
*/
router.post("/post/comments/remove", validateToken, (req, res, next) => {
    //Check if post exists
    Codepost.findOne({_id: req.body.postid}, (err, post) => {
        if(err) throw err;
        if(!post){
            return res.status(404).json({success: false, message: "No post found"});
        } else {
            Useracc.findOne({_id: req.body.uid}, (err, user) => {
                if(err) throw err;
                if(user){
                    if(user.admin){
                        Codepost.updateOne({_id: req.body.postid}, {$pull: {comments: {_id: req.body.commentid}}})
                        .then(result => {
                            const {matchedCount, modifiedCount } = result;
                            if(matchedCount && modifiedCount){
                                return res.status(302).json({success: true, message:"comment deleted"})
                            } else {
                                return res.status(403).json({success: false, message:"comment deletion failed"})
                            }
                        })
                    }else {
                        Codepost.updateOne({_id: req.body.postid}, {$pull: {comments: {commentorid: req.body.uid, _id: req.body.commentid}}})
                        .then(result => {
                            const {matchedCount, modifiedCount } = result;
                            if(matchedCount && modifiedCount){
                                return res.status(302).json({success: true, message:"comment deleted"})
                            } else {
                                return res.status(403).json({success: false, message:"comment deletion failed"})
                            }
                        })
                    }
                    

                } else {return res.status(404).json({success: false, message: "No user found"});}
            })
        }
    })
    //check if admin or comment poster requested
    //-> 
})

//Edits comment with validation

router.post("/post/comments/edit", validateToken, (req,res,next) => {
    Codepost.findOne({_id: req.body.postid}, (err, post) => {
        if(err) throw err;
        if(post){
            //Find one by the comments id in codeposts.comments array
            Codepost.updateOne({_id: req.body.postid, "comments._id": req.body.commentid},
                {$set: 
                    {
                        "comments.$.comment": req.body.comment,
                        "comments.$.commentdate": Date.now()
                    }
                }
            )
            .then(result => {
                //Checks if the modified count and matched count add up, otherwise send failure message
                const {matchedCount, modifiedCount } = result;
                if(matchedCount && modifiedCount){
                    return res.status(302).json({success: true, message:"comment update"})
                } else {
                    return res.status(403).json({success: false, message:"comment update failed"})
                }
            })
        }else {
            return res.status(404).json({success: false, message: "No post found"})
        }
    })
})

//Validateable
router.post("/post/comments/add", validateToken, (req, res, next) => {
    //Useracc.updateOne({_id: req.body.uid}, {$pull: {upvoted: req.body.postid}}).exec()
    Codepost.updateOne({_id: req.body.id}, {$push: { comments: {
        comment: req.body.comment,
        commentor: req.body.commentor,
        commentorid: req.body.commentorid,
        commentdate: Date.now(),
        upvotes: 0,
        downvotes: 0
    }
    }}).exec()
    return res.status(302).json({success: true, message: "comment succesfully posted!"});
})

//returns the comments on a specific post from the database
router.get("/post/:id/comments/list", (req, res, next) => {
    Codepost.findOne({_id: req.params.id}, (err, post) => {
        if(err) throw err;
        if(!post){
            return res.status(404).json({success: false, message: "No post found"});
        } else {
            return res.json({success: true, comments: post.comments})
        }
    })
})

//Changes the vote count of post according to req.body.votecount amount
router.post("/post/vote", (req, res, next) => {
    Codepost.findOne({_id: req.body.id}, (err, post) => {
        if(err) throw err;
        if(!post){
            return res.status(404).json({success: false, message: "No post found"});
        } else {
            Codepost.findOneAndUpdate({_id: req.body.id}, {$inc: {votes: req.body.votecount}}).exec()
            return res.json({success: true})
        }
    })
})



router.get("/post/:id", (req, res, next) => {
    Codepost.findOne({_id: req.params.id}, (err, post) => {
        if(err) throw err;
        if(!post){
            return res.status(404).json({success: false, message: "No post found"})
        } else {
            return res.json({success: true, post})
        }
    })
})

module.exports = router;