import {useState, useEffect} from "react";
import mongoose from "mongoose";

//A signle comment element on a post
//Gets data as params from the Codepost model
function PostCommentElement(params){

    //Boolean for conditional rendering on editing
    const [isEditing, setIsEditing] = useState(false);

    //Comment data for the display of the comment
    const [commentText, setCommentText] = useState("");
    const [commentLenghtLeft, setCommentLenghtLeft] = useState("");
    const [time, setTime] = useState();
    const maxCommentLenght = 350;

    //For Authorization and authentication purposes
    const uid = localStorage.getItem("uid");
    const authtoken = localStorage.getItem("auth_token")

    //If comment's delete button is pressed, Send a delete comment fetch post to the API and reload
    function onDelete(){
        fetch("../api/post/comments/remove", {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                "authorization": "Bearer "+authtoken
            },
            body: JSON.stringify({
                postid: params.postid,
                uid: uid,
                commentorid: params.commentorid,
                commentid: params.commentid
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        window.location.reload()
    }

    //Inefficient toggle -> wanted to use setIsEditin(!isEditing) but couldn't get it working
    function toggleEdit(){
        if(isEditing){
            setIsEditing(false);
        } else {
            setIsEditing(true);
            onCommentChange(params.comment);
        }
    }
    //Parse the Date data passed as string parameter
    useEffect(() => {
        let temptime = new Date(params.commentdate);
        setTime(temptime.getDate()+"."+(temptime.getMonth()+1)+"."+temptime.getFullYear()+" "+temptime.getHours()+":"+temptime.getMinutes()+"   UTC: "+temptime.getTimezoneOffset()/60)
    }, [])

    //Update "characters left" and text useState when typing to text area
    function onCommentChange(data){
        setCommentText(data);
        let lengthleft;
        
        if(commentText.length > maxCommentLenght){
            lengthleft = 0
        }else {
            lengthleft = maxCommentLenght - commentText.length;
        }
        setCommentLenghtLeft("Characters left: "+lengthleft);
    }

    //When save comment is pressed and the comment is right length -> edit fetch post comment to the API with token validation
    function saveCommentEdit(){
        if(commentText.length >maxCommentLenght)
        {
            alert("Comment too long");
        }else {
            fetch("../api/post/comments/edit", {
                method: "POST",
                headers: {
                    "Content-Type":"application/json",
                    "authorization": "Bearer "+authtoken
                },
                body: JSON.stringify({
                    postid: params.postid,
                    comment: commentText,
                    isadmin: params.isadmin,
                    commentorid: uid,
                    commentid: mongoose.Types.ObjectId(params.commentid)
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            })
        }
    }

    //if admin or original commentor give delete button -> i love conditional rendering apparently :)
    if(params.isadmin || params.commentorid == uid){
        if(isEditing){
            return(
                <div className="PostCommentEl">
                    <div className="CommentHeader">
                        <p>{params.commentor}</p>
                        <p>Date: {time}</p>
                    </div>
                    <div className="CommentTxt">
                        <pre ><textarea className="EditCommentTxtarea" value={commentText} onChange={(e)=>onCommentChange(e.target.value)}/></pre>
                    </div>
                    <div className="CommentElStats">
                        <button onClick={saveCommentEdit}>Save</button>
                        <button onClick={toggleEdit}>Cancel</button>
                        <span>{commentLenghtLeft}</span>
                        <div className='delete-button' onClick={() => {  const r = window.confirm('Are you sure you want to delete the comment?'); if(r==true) {onDelete()}  }}><button>Delete</button> </div>
                    
                    </div>
                </div>
            )
        }else {
            return(
                <div className="PostCommentEl">
                    <div className="CommentHeader">
                        <p>{params.commentor}</p>
                        <p>Date: {time}</p>
                    </div>
                    <div className="CommentTxt" onClick={toggleEdit}>
                        <pre><p>{params.comment}</p></pre>
                    </div>
                    <div className="CommentElStats">
                    <div className='delete-button' onClick={() => {  const r = window.confirm('Are you sure you want to delete the comment?'); if(r==true) {onDelete()}  }}><button>Delete</button> </div>
    
                    </div>
                </div>
            )
        }
        
    }else {
        return(
            <div className="PostCommentEl">
                <div className="CommentHeader">
                    <p>{params.commentor}</p>
                    <p>Date: {time}</p>
                </div>
                <div className="CommentTxt">
                    <pre><p>{params.comment}</p></pre>
                </div>
            </div>
        )
    }
    
}

export default PostCommentElement;