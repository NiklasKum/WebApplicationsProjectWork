/*
AUTHOR: NIKLAS KUMPULAINEN
EMAIL: Niklas.kumpulainen@student.lut.fi
STU. NUM: 0567737
Date: 17.12.21
COURSE: Web Applications CT30A3203

Note: The project was done independently using the help of external information in the form of tutorials and StackOverflow. If some implementation was needed to be
copied, there are required refrence notations commented near the module. Some features were left out for time management reasons and HOPEFULLY all required mandatory
features have been implemented to satisfactory quality.

Features done(ish):
- Log in and register authentications
- authorization back end with JWT
- create and edit posts
- create and edit comments
- navigation back end
- Posts views
- voting posts
- admin account

Left off/not done:
- Check every route that needs authentication has it
- Account details
- highlights
- documentation

THANK YOU FOR READING

*/

import Header from "./components/Header";
import './App.css';
import {BrowserRouter as Router, Route, Routes, Link} from "react-router-dom";
import Homepage from './components/Homepage';
import Register from "./components/Register";
import Login from "./components/Login";
import Posts from "./components/Posts";
import PostView from "./components/PostView";
import PostCreate from "./components/PostCreate";
import AuthRoute from "./components/AuthRoute";
import {useState, useEffect} from "react";

//Main routing and navigation system of the application

function App() {
  const authtoken = localStorage.getItem("auth_token");
  function HasAuthToken(){
    if(authtoken){
      return true;
    } else {
      return false;
    }
  }

  return (
    <Router>
      <div className="App">
        <Header loggedin={HasAuthToken()}/>
        <Routes>
          <Route path="/" element={
              <>
                <Homepage/>

              </>
            }
          />
          <Route path="/register" element={
              <>
                <Register />

              </>
            }
          />
          <Route path="/login" element={
              <>
                <Login />

              </>
            }
          />
          <Route path="/posts" element={
              <>
                <Posts />

              </>
            }
          />
          <Route path="/posts/add" element={
              <>
                <AuthRoute component={PostCreate}/>

              </>
            }
          />
          <Route path="/posts/:id" element={
              <>
                <PostView />

              </>
            }
          />
          <Route path="*" element={
            <>
            <h1>404</h1>
            <p>this is not the webpage you are looking for</p>
            </>
          }
          />
        </Routes>
      </div>
    </Router>

  );
}

export default App;
