import { Input } from "@mui/material";
import {useState, useEffect} from "react";
import PostElement from "./PostElement";
import Postsheader from "./Postsheader";

//The posts listing view. Lists all the Codepost model's tables from the database.

function Posts() {

    //Get login confirmation and display posts
    const authtoken = localStorage.getItem("auth_token");
    const [_posts, setPosts] = useState([]);

    //Creating item to array from json item
    const addPost = (post, i) => {
        const id = _posts.length+i;
        const newPost = {id, ...post}
        setPosts(_posts => [..._posts, newPost]);
    }

    

    //For every post in the json file create a item in useffect array
    function handledata(data){

        data.forEach((element, index) => {
            addPost(element, index);

        });

    }

    //fetch and Create posts array from scratch when loading
    useEffect(() => {
        fetch("/api/post/list", {method: "GET"})
        .then(response => response.json())
        .then(data => handledata(data));
            
    }, [])

    return (
        <div>
            <h1>Posts</h1>
            <Postsheader token={authtoken}/>
            <div className="PostContainer">
                {_posts.map((post) => (
                    <PostElement key={post.id} id={post._id} title={post.title} desc={post.description} code={post.code} votes={post.votes} poster={post.poster} date={post.postdate.toString()} lang={post.language}/>
                ))}
            </div>
        </div>
    )
}

export default Posts;