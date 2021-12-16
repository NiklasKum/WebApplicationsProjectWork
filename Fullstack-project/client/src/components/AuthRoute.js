import {useState, useEffect} from "react";

//This is really scuffed DIY authorization route thingy-ma-jig
//TL;DR does api fetch that requires token authorization -> if it gets it, display parameter component

function AuthRoute({component: Component}){
    const [IsAuthorized, setIsAuthorized] = useState(false);
    const authtoken = localStorage.getItem("auth_token")
    useEffect(() => {
        fetch("/api/validate", {
            method: "GET",
            headers: {
                "authorization": "Bearer "+authtoken
            }
        })
        .then(response => response.json())
        .then(data => handleData(data))
        .catch((error) => {
            console.log(error);
            //Check if session time out
            if(authtoken){
                LogOut();
            }
        })

    }, [])

    //log out functionality for session timeout/coockie expiration
    function LogOut(){
        localStorage.removeItem("auth_token");
        localStorage.removeItem("uid");
        alert("Session has timed Out. Please log back in");
        window.location.href = "/";
    }

    function handleData(data){
        if(data.success){
            setIsAuthorized(true);
            console.log("Authorization succesfull");
        } else {
            console.log("failed");
        }
    }

    //Displays the parameter component if authorization is succesfull, otherwise return nothing before redirection
    if(IsAuthorized){
        return(
            <Component />
        )
    }else {
        return(
            <div>

            </div>
        )
    }
}   

export default AuthRoute;