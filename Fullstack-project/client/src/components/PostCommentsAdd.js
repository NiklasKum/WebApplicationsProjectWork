import {useState, useEffect} from "react";

//Comment text area component with the basic functionality of dynamically handling the textarea data
//Is A component in PostView that handles getting user input data and sending comments
function PostCommentsAdd(params) {

    const [commentText, setCommentText] = useState("");
    const [commentLenghtLeft, setCommentLenghtLeft] = useState("");
    const maxCommentLenght = 350;
    const authtoken = localStorage.getItem("auth_token");
    const uid = localStorage.getItem("uid");

    useEffect(() => {
        onCommentChange("");
    }, [])

    //Same function as in PostCommentElement
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

    //When Submit button is pressed, Sends the fetch post to the database and reloads the page
    const onSubmit = (e) =>{
        if(commentText.length > maxCommentLenght){
            alert("Comment is too long, Maximum comment length is 150 characters!")
        }else {
            e.preventDefault()
        fetch("/api/post/comments/add", {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                "authorization": "Bearer "+authtoken
            },
            body: JSON.stringify({
                id: params.postid,
                comment: commentText,
                commentor: params.username,
                commentorid: uid
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        }
        setCommentText("");
        window.location.reload()
    }



    return (
        
        <div className="PostCommentsAdd">
            <form id="commentform" onSubmit={(e) => onSubmit(e)}>
                <span className="Backlink">Comment: </span>
                <div >
                    <textarea className="PCAtextarea" form="commentform" value={commentText} onChange={(e)=>onCommentChange(e.target.value)}></textarea>
                </div>
                <div  className="PCAstats">
                    <input  type="submit" value="Comment"></input>
                    <span>{commentLenghtLeft}</span>
                </div>
            </form>
            
        </div>
    )
}

export default PostCommentsAdd;