
//Posts' listing views header with conditional rendering depending if logged in

function Postsheader(params) {

    function goToCreatePost(){
        window.location.href ="/posts/add";
    }

    

    if(params.token){
        return (
            <div>
                
                <button className="CreatePostBtn" onClick={goToCreatePost}>Create a post!</button>
                <div>
                    <p>Click the posts to see the whole context and comments!</p>
                </div>
            </div>
        )
    } else {
        return(
            <div>
                <div>
                <p>You have to <a href="/register">sign up</a> or <a href="/login">log in</a> to vote, comment or to create a post!</p>

                </div>
                <div>
                    <p>Click the posts to see the whole context and comments!</p>
                </div>
            </div>
            
        )
    }

}

export default Postsheader;