import {useState, useEffect} from "react";

//Application header, went with more "traditional" header even though could have used materialize

function Header(props) {
    //Checks if user has logged in and gives conditional rendering
    const isloggedin = props.loggedin;

    //Removes local storage before going to index page
    function LogOut(){
        localStorage.removeItem("auth_token")
        localStorage.removeItem("uid")
        window.location.href = "/";
    }

    //Conditionaly Header rendering
    if(isloggedin){
        return(
            <div className="AppHeader">
                <a className="Headerlink" href="/">Home</a>
                <a className="Headerlink" href="/posts">Posts</a>
                {/*<a className="Headerlink">Account</a>*/}
                <a className="Headerlink" href="" onClick={LogOut}>Log Out</a>
            </div> 
        )
    } else {
        return(
            <div className="AppHeader">
                <a className="Headerlink" href="/">Home</a>
                <a className="Headerlink" href="/posts">Posts</a>
                <a className="Headerlink" href="/register">Register</a>
                <a className="Headerlink" href="/login">Log In</a>
            </div>
        )
    }
}

export default Header;