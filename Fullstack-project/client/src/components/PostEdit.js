import {useState, useEffect} from "react";

//Edit view of PostView
function PostEdit(params){

    //Basic user input variables
    const [title, setTitle] = useState("");
    const [lang, setLang] = useState("");
    const [code, setCode] = useState("");
    const [desc, setDesc] = useState("");

    function setDataFromParams(){
        setTitle(params.title);
        setLang(params.lang);
        setCode(params.code);
        setDesc(params.desc);
    }

    useEffect(() => {
        setDataFromParams();
    }, [])

    //Instead of creating, the fetch post updates the existing post
    function PostUpdate(){

        fetch("/api/post/update", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                id: params.id,
                poster: params.poster,
                title: title,
                desc: desc,
                code: code,
                language: lang
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        params.toggleEdit();
    }

    //Suprisingly enough this function deletes the post
    function DeletePost(){
        fetch("/api/post/remove", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                id: params.id
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        window.location.href = "/posts";
        alert("Post was deleted");
    }

    return(
        <div>
            <form id="postform">
                <div>
                    <div className="PostEditHeader">
                        <h2>Edit your post</h2>
                        <label>Title: </label>
                        <input className="PostEditTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
                        <div>
                            <span className="Headerlink">by: {params.poster}</span>
                            <span className="Headerlink">date: {params.date}</span>
                            <label className="Headerlink">
                                Language: 
                                <input  type="text" value={lang} onChange={(e) => setLang(e.target.value)}></input>
                            </label>
                            
                        </div>
                        
                    </div>
                    <div className="PostViewDescription">
                        <label>Description: </label>
                        <textarea className="PostEditTxtAreaDesc" name="Desc" form="postform" value={desc} onChange={(e) => setDesc(e.target.value)}/>
                    </div>
                    <div>
                        <label className="Backlink">Code: </label>
                        <pre><code><textarea rows="30" name="Code" className="PostEditTxtAreaCode" form="postform" value={code} onChange={(e) => setCode(e.target.value)} /></code></pre>
                    </div>
                    <p className="Backlink">Votes:{params.votes}</p>
                    <div className="PostViewStats">
                        
                        <button onClick={PostUpdate}>Save</button>
                        <button onClick={params.toggleEdit}>Cancel</button>
                    </div>
                </div>
            </form>
            <div className='delete-button' onClick={() => {  const r = window.confirm('Are you sure you want to delete the post?'); if(r==true) {DeletePost()}  }}><button>Delete</button> </div>
        </div>
        
    )
}

export default PostEdit