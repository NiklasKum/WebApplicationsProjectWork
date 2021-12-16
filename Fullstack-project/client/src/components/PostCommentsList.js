import {useState, useEffect} from "react";
import PostCommentElement from "./PostCommentElement";

//Gets list as params from PostView
//Displays all the comments of a respective Post view
function PostCommentsList(params){
    const [comments, setComments] = useState([]);

    //makes the comment list at startup
    useEffect(() => {
        fetch("../api/post/"+params.postid+"/comments/list", {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => handleCommentData(data))
    }, [])

    function handleCommentData(data){
        data.comments.forEach((element, index) => {
            addComment(element, index)
        });
    }

    //Adds posts comments into a list to be passed into Post Comment Element
    const addComment = (comm, i) => {
        const id = comments.length+i;
        const newComment = {id, ...comm}
        setComments(comments => [...comments, newComment]);
    }

    return (
        <div className="CommentsContainer">
            <span className="Backlink">Comments: </span>
            {comments.map((comment) => (
                <PostCommentElement key={comment.id} postid={params.postid}  commentor={comment.commentor} commentdate={comment.commentdate} comment={comment.comment} isadmin={params.isadmin} commentorid={comment.commentorid} commentid={comment._id}/>
            ))}
        </div>
    )
}

export default PostCommentsList;