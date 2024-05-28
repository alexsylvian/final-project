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
                <h1>Users</h1>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.position}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default UsersPage