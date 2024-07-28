import React, { useState, useEffect } from "react";
// import { Typography } from "@mui/material";
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
                {/* <Typography variant="h4" gutterBottom> */}
                    <h1>Users</h1>
                {/* </Typography> */}
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Position</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.position}</td>
                                <td>{user.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default UsersPage