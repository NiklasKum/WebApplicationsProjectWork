import {useState, useEffect} from "react";


//The basic login functionality in the Login view at "/login"
function Login() {

    //Save user input data
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [adminIsCreated, setAdminIsCreated] = useState(false);

    //create admin account if one is not created yet, Dont do in production very risky
    useEffect(() => {
        if(!adminIsCreated){
        fetch("/api/admin/create", {
            method: "POST",
            headers: {"Content-Type":"application/json"}
        })
        .then(response => response.json())
        .then(data => console.log(data));
        setAdminIsCreated(true);
        }
    }, [])

    
    function loginFailed(e){
        setUsername("");
        setPassword("");
        alert(e)
        console.log(e)
    }

    //Handle form submitting
    const onSubmit = (e) => {
        e.preventDefault();
        
        fetch("/api/login", {
            method: "post",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => loginSuccessfull(data))
        .catch((error) => {
            loginFailed(error);
        })
        }

    //If login returned a token -> it succeeded.
    //The basic info is stored to localstorage
    function loginSuccessfull(data){
        if(data.token){
            //Save token for validation purposes
            localStorage.setItem("auth_token", data.token);
            //also store only user id for query purposes locally
            localStorage.setItem("uid", parseJwt(data.token).id);
            alert("Login successfull");
            window.location.href = "/"
        } else {
            alert(data.message);
        }
    }

    //For complexity of the problem and the popularity of the code snippet, the following function has been copied from: https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
    //all credits from "parseJwt" function go to user, Peheje, from Stackoverflow
    function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };

    return(
        <div>
            <h2>Log in</h2>
            <form onSubmit={onSubmit}>
                <div className="RegisterCont">
                    <div>
                        <label>Username or email</label>
                    </div>
                    <div>
                        <input className="RegisterInputTxt" type="text" placeholder="Username or email"  onChange={(e)=>setUsername(e.target.value)} value={username}></input>
                    </div>
                    
                </div>
                
                <div className="RegisterCont">
                    <div>
                        <label>Password</label>
                    </div>
                    <div>
                        <input className="RegisterInputTxt" type="password" placeholder="Password"  onChange={(e)=>setPassword(e.target.value)} value={password}></input>
                    </div>   
                </div>
                <div>
                    <input className="RegisterSubmit" type="submit" value="Log In"></input>
                </div>
                
            </form>
        </div>
    )
}

export default Login;