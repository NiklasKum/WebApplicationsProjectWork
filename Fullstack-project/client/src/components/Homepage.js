import {useState, useEffect} from "react";

//The contents of index page, Displays personalized message if user has logged in

function Homepage() {

    const [username, setUsername] = useState("");

    const authToken = localStorage.getItem("auth_token");
    const uid = localStorage.getItem("uid");
    //fetch username if userid isnt null
    useEffect(() => {
        if(uid){
            fetch("/api/userdetails/"+uid)
            .then(response => response.json())
            .then(data => handleData(data))
        }
    }, [])

    function handleData(data){
        if(data.success === true){
            setUsername(data.username)
        }
    }

    if(authToken){
        //authentication token exist, display username
        
        return(
            <div>
                <h1>Welcome back {username}! </h1>
                <p>Get started by going to Posts section!</p>
            </div>
        )
    }else {
        //No login
        return(
            <div>
                <h1>Welcome to MyCodeBorke</h1>
                <p>In this one of a kind website you can post your coding related problems with snippets and much more</p>
                <div>
                    <h2>Popular posts this week</h2>
                </div>
            </div>
            
            
        )
    }
    
}


export default Homepage;