import {useState, useEffect} from "react";
import React from "react";
import {BrowserRouter as Router, Route, Routes, Link} from "react-router-dom";


//Create post view where user can create a totally new post
function PostCreate(){

    //Basic input variables for the POST fetch of the post
    const [title, setTitle] = useState("");
    const [lang, setLang] = useState("");
    const [code, setCode] = useState("");
    const [desc, setDesc] = useState("");

    //get user id to fetch basic user details
    const [username, setUsername] = useState("");

    const authToken = localStorage.getItem("auth_token");
    const uid = localStorage.getItem("uid");

    function handleData(data){
        if(data.success === true){
            setUsername(data.username);
        }
    }
    //fetch username if userid isnt null
    useEffect(() => {
        if(uid){
            fetch("/api/userdetails/"+uid)
            .then(response => response.json())
            .then(data => handleData(data))
        }
    }, [])

    //Posts the user input data as json into the database
    const PushNewPost= (e) => {

        e.preventDefault();

        fetch("/api/post/add", {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                "authorization": "Bearer "+authToken
            },
            body: JSON.stringify({
                poster: username,
                title: title,
                desc: desc,
                code: code,
                lang: lang
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .then(window.location.href ="/posts")
    }

    

    return(
        <form id="PostCreate" onSubmit={PushNewPost}>
            <div>
                <h1>Create a post</h1>
                <div className="PostEditHeader">
                    <label>Title: </label>
                    <input className="PostEditTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
                    <div>
                        <span className="Headerlink">by: {username}</span>
                        <label className="Headerlink">
                            Language: 
                            <input  type="text" value={lang} onChange={(e) => setLang(e.target.value)}></input>
                        </label>
                        
                    </div>
                    
                </div>
                <div className="PostViewDescription">
                    <label>Description: </label>
                    <textarea className="PostEditTxtAreaDesc" name="Desc" form="PostCreate" value={desc} onChange={(e) => setDesc(e.target.value)}/>
                </div>
                <div>
                    <pre><code><textarea rows="30" name="Code" className="PostEditTxtAreaCode" form="PostCreate" value={code} onChange={(e) => setCode(e.target.value)} /></code></pre>
                </div>
                <input type="submit" value="Create"/>
                <Link to="/posts" className="btn btn-primary">Cancel</Link>

                <div className="PostViewComments">
                    
                </div>
            </div>
        </form>
    )
}

export default PostCreate