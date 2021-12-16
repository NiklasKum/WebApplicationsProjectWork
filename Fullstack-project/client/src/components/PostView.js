
import {useState, useEffect} from "react";
import PostEdit from "./PostEdit";
import {
    useParams
  } from "react-router-dom";
import mongoose from "mongoose";
import PostCommentsAdd from "./PostCommentsAdd";
import PostCommentsList from "./PostCommentsList";

/*
Component: PostView
Note:
By far the largest single component of the project. Here is a quick run through and 
hindsight.

Run-through:
Functionality: PostView is the the view user sees after clicking a particular post in the
posts listing view. Post view expands the Post and its data to one page. User can see header
data, title, description and codesnippet. Also comments and voting system is stitched to the bottom
of the post. If user is admin or the user's objectID matches the posts in the database, a "edit mode"
is displayed. IN the edit mode there is Edit button which leads to editing the post. If the user is not
logged in, The voting and Commenting system is not displayed, but the vote count and comments are as well
as the post.

Hindsight:
    The component is very large because I really didn't have the time to minimalize it further
    -> I could've made most of the conditional rendering into individual components
    -> Since most of the time the difference is so minimal, I decided to copy and paste the same view
    with the additions for the conditions
    ->The Upvote and downvote function is a mess. It is working but if I minimalize it now on the fly, 
    im afraid it will break and would take too much time from other aspects
    ->
*/


function PostView(){
    //User variables that are fetched
    const [username, setUsername] = useState("");
    const [is_admin, setIsAdmin] = useState(false);
    const [userupvoted, setUserupvoted] = useState([]);
    const [userdownvoted, setUserdownvoted] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    //Boolean for conditional rendering -> does the post exist
    const [exists, setExists] = useState(true);
    //Document vairables that are fetched
    const [poster, setPoster] = useState("");
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [code, setCode] = useState("");
    const [votes, setVotes] = useState("");
    const [lang, setLang] = useState("");
    const [time, setTime] = useState();
    const [comments, setComments] = useState([]);
    const {id} = useParams();

    //Booleans for conditional renderign on vote buttons
    const [userHasDownvoted, setuserHasDownvoted] = useState(false);
    const [userHasUpvoted, setuserHasUpvoted] = useState(false);

    
    //Adds comments to the list
    const addComment = (comment,i) =>{
        const id=comments.length+i;
        const newComment={id, ...comment};
        setComments(comments => [...comments, newComment]);
    }

    const uid = localStorage.getItem("uid");
    const token = localStorage.getItem("auth_token");
    

    useEffect(() => {
        //Check if user has logged in and username for comparison
        fetchUserInfo();
        //Get "id" params which is described in "App.js" posts/id routing option
        fetchPostInfo();
        console.log("upvoted: "+userupvoted);
        console.log("downvoted: "+userdownvoted);
    }, [])

    function fetchPostInfo(){
        //Checks first if the paramater id.id is valid ObjectID type of the mongoose api
        if(mongoose.Types.ObjectId.isValid({id}.id))
            fetch("/api/post/"+{id}.id)
            .then(response => response.json())
            .then(data =>handlePostData(data))
            .catch((error) => {
                console.log(error);
                setExists(false);
            })
        else {
            setExists(false);
        }
    }

    function fetchUserInfo(data){
        //console.log(data);
        if(uid){
            console.log("Fetching user info")
            fetch("/api/userdetails/"+uid)
            .then(response => response.json())
            .then(data => handleUserData(data))
        }
    }

    //populate post with useEffect data
    function handlePostData(data){
        //console.log(data);
        setPoster(data.post.poster);
        setTitle(data.post.title);
        setDesc(data.post.description);
        setCode(data.post.code);
        setVotes(data.post.votes);
        setLang(data.post.language);
        let temptime = new Date(data.post.postdate);
        setTime(temptime.getDate()+"."+(temptime.getMonth()+1)+"."+temptime.getFullYear()+" "+temptime.getHours()+":"+temptime.getMinutes()+"   UTC: "+temptime.getTimezoneOffset()/60)
        data.post.comments.forEach((element, index) => {
            addComment(element, index)
        });
    }

    //Use data fetched from /useretails
    function handleUserData(data){
        if(data.success === true){
            setUsername(data.username);
            setIsAdmin(data.admin);
            setUserupvoted(data.upvoted);
            setUserdownvoted(data.downvoted);
            //console.log(userupvoted);
        }
    }

    //When Upvotebutton is pressed
    function handleUpvote(){
        if(token){
            //Check that user has not voted already for the post
            //-> fetch user upvotes id and compare to current post == Done previously

            //if user has upvoted for the post, perform upvote rollback (Take the upvote "back")
            //->decrease upvote property of post by one
            //->remove upvoted post's id from user votes list
            if(userupvoted.includes({id}.id)){
                console.log("Already voted once -> Unvoting")
                setuserHasUpvoted(false);
                const payload= {
                    id:{id}.id,
                    votecount: -1
                }
                //->post the upvote & refresh info onpage
                fetch("../api/post/vote", {
                    method: "post",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify(payload)
                    
                })
                .then(response => response.json())
                .then(data => refreshPostInfo(data))

                //Pull the upvote id from user details
                fetch("../api/userdetails/voted/pull", {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({
                        uid: uid,
                        postid: {id}.id.toString(),
                        toUpvote: true
                    })
                })
                .then(response => response.json())
                .then(data => refreshUserInfo(data))
            }
            //if user hasnt upvoted for the post
            //->User increment upvote property of post by one
            //->add upvoted post's id to user votes list
            else{
                //Check whether user has downvoted before upvoting
                //->negate the downvote, and take the id out of user details
                let votecountI = 1;
                if(userdownvoted.includes({id}.id)){
                    //Change vote count to be passed into 2 and remove the id from database, then continue normally
                    setuserHasDownvoted(false);
                    votecountI = 2;
                    fetch("../api/userdetails/voted/pull", {
                        method: "POST",
                        headers: {"Content-Type":"application/json"},
                        body: JSON.stringify({
                            uid: uid,
                            postid: {id}.id,
                            toUpvote: false
                        })
                    })
                    .then(response => response.json())
                    .then(data => console.log(data))
                }
                const payload= {
                    id:{id}.id,
                    votecount: votecountI
                }
                setuserHasUpvoted(true);
                //->post the upvote & refresh info onpage
                fetch("../api/post/vote", {
                    method: "post",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify(payload)
                    
                })
                .then(response => response.json())
                .then(data => refreshPostInfo(data))
                
                //->add post id to Useraccount schema
                fetch("../api/userdetails/voted/push", {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({
                        uid: uid,
                        postid: {id}.id,
                        toUpvote: true
                    })
                })
                .then(response => response.json())
                .then(data => refreshUserInfo(data))
            }
            
        } else {
            alert("You have to be logged in to vote!")
        }

    }

    //symmetrical opposite to upvote
    function handleDownvote(){
        if(token){
            //if already downvoted, remove downvote
            if(userdownvoted.includes({id}.id)){
                console.log("Already voted once -> Unvoting")
                setuserHasDownvoted(false);
                const payload= {
                    id:{id}.id,
                    votecount: 1
                }
                //->post the downvote & refresh info onpage
                fetch("../api/post/vote", {
                    method: "post",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify(payload)
                    
                })
                .then(response => response.json())
                .then(data => refreshPostInfo(data))

                //Pull the upvote id from user details
                fetch("../api/userdetails/voted/pull", {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({
                        uid: uid,
                        postid: {id}.id,
                        toUpvote: false
                    })
                })
                .then(response => response.json())
                .then(data => refreshUserInfo(data))
            }
            //if user hasnt downvoted for the post
            //->User decrease vote property of post by one
            //->add downvoted post's id to user downvote list
            else{
                //Check whether user has upvoted before downvoting
                //->negate the upvote, and take the id out of user details
                let votecountI = -1;
                if(userupvoted.includes({id}.id)){
                    //Change vote count to be passed into 2 and remove the id from database, then continue normally
                    votecountI = -2;
                    setuserHasUpvoted(false);
                    fetch("../api/userdetails/voted/pull", {
                        method: "POST",
                        headers: {"Content-Type":"application/json"},
                        body: JSON.stringify({
                            uid: uid,
                            postid: {id}.id,
                            toUpvote: true
                        })
                    })
                    .then(response => response.json())
                    .then(data => console.log(data))
                }
                const payload= {
                    id:{id}.id,
                    votecount: votecountI
                }
                setuserHasDownvoted(true);
                //->post the upvote & refresh info onpage
                fetch("../api/post/vote", {
                    method: "post",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify(payload)
                    
                })
                .then(response => response.json())
                .then(data => refreshPostInfo(data))
                
                //->add post id to Useraccount schema
                fetch("../api/userdetails/voted/push", {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({
                        uid: uid,
                        postid: {id}.id,
                        toUpvote: false
                    })
                })
                .then(response => response.json())
                .then(data => refreshUserInfo(data))
            }
            
        } else {
            alert("You have to be logged in to vote!")
        }
    }

    //if vote operation is successfull, refresh page info
    function refreshPostInfo(data){
        if(data.success){
            fetchPostInfo();
        }
    }
    //re fetches user info if data processing is succesfull
    function refreshUserInfo(data){
        if(data.success){
            //console.log("Upvoted push successfull")
            fetchUserInfo();
        }
    }

    function refreshPage(){
        window.location.reload();
    }

    //Toggles editing's coditional rendering
    function toggleEdit(){
        if(isEditing){
            setIsEditing(false);
            refreshPage();
        } else {
            setIsEditing(true);
        }
    }

    //If post poster is equal to the authenticated user, grant powers to edit post
    if(exists){
        if((username != "" && (username === poster)) || is_admin){
            //Poster mode
    
            if(isEditing){
                //editor mode
                //Insert parameters into PostEdit component
                return (
                    
                    <PostEdit toggleEdit={toggleEdit} title={title} lang={lang} code={code} desc={desc} votes={votes} id={{id}.id} poster={poster}/>
                )
            }
            return (
                <div className="PostView">
                    <div>
                    <a className="Backlink" href="/posts">Back</a>
                    </div>
                    <div className="PostViewHeader">
                        <h2>{title}</h2>
                        <span className="Headerlink">by: {poster}</span>
                        <span className="Headerlink">date: {time}</span>
                        <span className="Headerlink">language: {lang}</span>
                    </div>
                    <div className="PostViewDescription">
                        <p>{desc}</p>
                    </div>
                    <div className="PostViewCode">
                        <pre><code>{code}</code></pre>
                    </div>
                    <div className="PostViewStats">
                        <span>votes: {votes}</span>
                        <button className="UpvoteBtn" onClick={handleUpvote} style={userHasUpvoted ? {textDecoration: 'underline'}:{textDecoration: ''}}>Up Vote</button>
                        <button className="DownvoteBtn" onClick={handleDownvote} style={userHasDownvoted ? {textDecoration: 'underline'}:{textDecoration: ' '}}>Down Vote</button>
                        <button className="EditBtn" onClick={toggleEdit}>Edit</button>
                    </div>
                    <div className="PostViewCommentsTextarea">
                        <PostCommentsAdd postid={{id}.id} username={username}></PostCommentsAdd>
                    </div>
                    <div className="PostViewCommentsList">
                        <PostCommentsList postid={{id}.id} isadmin={is_admin}></PostCommentsList>
                    </div>
                </div>
            )
        } else {
            //Viewing mode
            if(token){
                //If user has logged in
                return (
                    <div className="PostView">
                        <div>
                            <a className="Backlink" href="/posts">Back</a>
                        </div>
                        <div className="PostViewHeader">
                            <h2>{title}</h2>
                            <span className="Headerlink">by: {poster}</span>
                            <span className="Headerlink">date: {time}</span>
                            <span className="Headerlink">language: {lang}</span>
                        </div>
                        <div className="PostViewDescription">
                            <p>{desc}</p>
                        </div>
                        <div className="PostViewCode">
                            <pre><code className="language-html">{code}</code></pre>
                        </div>
                        <div className="PostViewStats">
                            <span>votes: {votes}</span>
                            <button className="UpvoteBtn" onClick={handleUpvote} style={userHasUpvoted ? {textDecoration: 'underline'}:{textDecoration: ' '}}>Up Vote</button>
                            <button className="DownvoteBtn" onClick={handleDownvote} style={userHasDownvoted ? {textDecoration: 'underline'}:{textDecoration: ' '}}>Down Vote</button>
                        </div>
                        <div className="PostViewCommentsTextarea">
                            <PostCommentsAdd postid={{id}.id} username={username}></PostCommentsAdd>
                        </div>
                        <div className="PostViewCommentsList">
                            <PostCommentsList postid={{id}.id} isadmin={is_admin}></PostCommentsList>
                        </div>
                    </div>
                )
            } else {
                //If user hasn't logged in
                return (
                    <div className="PostView">
                        <div>
                            <a className="Backlink" href="/posts">Back</a>
                        </div>
                        <div className="PostViewHeader">
                            <h2>{title}</h2>
                            <span className="Headerlink">by: {poster}</span>
                            <span className="Headerlink">date: {time}</span>
                            <span className="Headerlink">language: {lang}</span>
                        </div>
                        <div className="PostViewDescription">
                            <p>{desc}</p>
                        </div>
                        <div className="PostViewCode">
                            <pre><code className="language-html">{code}</code></pre>
                        </div>
                        <div className="PostViewStats">
                            <span>votes: {votes}</span>
                        </div>
                        <div className="PostViewCommentsTextarea">
                        <p>You have to <a href="/register">sign up</a> or <a href="/login">log in</a> to vote or to comment!</p>
                        </div>
                        <div className="PostViewCommentsList">
                            <PostCommentsList postid={{id}.id} isadmin={is_admin}></PostCommentsList>
                        </div>
                    </div>
                )
            }
            
        }
    } else {
        return(
            <div>
                <h1>404</h1>
                <h3>The post you were trying to find doesn't exist.</h3>
                <p>Try to reload the page or contact customer support</p>
            </div>
        )
    }
    
}
export default PostView;