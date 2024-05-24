import React, { useState, useEffect } from "react";
import NavBar from "../components/Navbar";

function UsersPage(){
    const [users, setUsers] = useState([])

    useEffect(() => {
        fetch('/users')
          .then(response => response.json())
          .then(data => setUsers(data))
          .catch(error => console.error('Error fetching projects:', error));
    }, []);
    
    return(
        <>
        <NavBar />
        <div>
            <h1>USERS</h1>
            <div className="users">
                {users.map((user) => (
                    <h1 key={user.id}>{user.username}</h1>
                ))}
            </div>
        </div>   
        </>
    )
}

export default UsersPage