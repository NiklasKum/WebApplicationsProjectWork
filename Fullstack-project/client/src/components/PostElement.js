import {useState, useEffect} from "react";

//The Post element that is seen in the Post listing in Posts view at "/posts"
//List consists of multiple PostElements such as this one
function PostElement(params) {

    const maxCharAmount = 100;
    var codeProduct = params.code;
    const [time, setTime] = useState();
    //add on click to div PostElement to get to the Actual Signe Post view, params need to include post object id to compare to database

    //Check if Code Snippet is too long, if so then only show string.substring(0,n)

    if(codeProduct.length > maxCharAmount){
        codeProduct = codeProduct.substring(0,maxCharAmount-3)+"\n...";
    } 

    //Date.getMonth is indexed at 0 for some reason?? i cant even
    useEffect(() => {
        let temptime = new Date(params.date);
        setTime(temptime.getDate()+"."+(temptime.getMonth()+1)+"."+temptime.getFullYear()+" "+temptime.getHours()+":"+temptime.getMinutes()+"   UTC: "+temptime.getTimezoneOffset()/60)
    }, [])

    //Redirect user to specific post view
    function onClick(){
        window.location.href = "/posts/"+params.id
    }

    return (
        <div className="PostElement" onClick={onClick}>
            <div className="PostHeader">
                <h4>{params.title}</h4>
            </div>
            <div className="PostSubtitle">
                <span className="Headerlink">By: {params.poster}</span>
                <span className="Headerlink">Date: {time}</span>
                <span className="Headerlink">Language: {params.lang}</span>
            </div>
            <div className="PostDescription">
                <p>{params.desc}</p>
            </div>
            <div className="PostCode">
                <pre><code>{codeProduct}</code></pre>
            </div>
            <div className="PostStats">
                <span>Votes: {params.votes}</span>
            </div>
        </div>
    )
}

export default PostElement;