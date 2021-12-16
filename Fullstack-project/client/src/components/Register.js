import {useState, useEffect} from "react";

//The registeration functionality of the "/register" page

function Register() {

    //Save user input data
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [reemail, setReemail] = useState("");
    const [password, setPassword] = useState("");

    //Handle form submitting
    const onSubmit = (e) => {
        e.preventDefault();
        
        if(email === reemail){
            fetch("/api/register", {
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => registerSuccess(data))
        }
    }

    //Uses browser alerts to communicate system status
    function registerSuccess(data){
        if(data.success === true){
            alert("Registeration successfull");
            window.location.href = "/login"
        } else {
            alert("Registeration failed");
            console.log("Registeration failed");
        }
    }

    return(
        <div className="Register">
            <h2>Register</h2>
            <form onSubmit={onSubmit}>
                <div className="RegisterCont">
                    <div>
                        <label>Username</label>
                    </div>
                    <div>
                        <input className="RegisterInputTxt" type="text" placeholder="Username" onChange={(e)=>setUsername(e.target.value)}></input>
                    </div>
                </div>
                
                <div className="RegisterCont">
                    <div>
                        <label>Email</label>
                    </div>
                    <div>
                        <input className="RegisterInputTxt" type="text" placeholder="Email" onChange={(e)=>setEmail(e.target.value)}></input>
                    </div>
                </div>
                

                <div className="RegisterCont">
                    <div>
                        <label>Re-enter email</label>
                    </div>
                    <div>
                        <input className="RegisterInputTxt" type="text" placeholder="Re-enter Email" onChange={(e)=>setReemail(e.target.value)}></input>
                    </div>
                </div>

                <div className="RegisterCont">
                    <div>
                        <label>Password</label>
                    </div>
                    <div>
                        <input className="RegisterInputTxt" type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}></input>
                    </div>
                </div>
                <div>
                    <input className="RegisterSubmit" type="submit" value="Sign up"></input>
                </div>
                
            </form>
        </div>
    )
}

export default Register;