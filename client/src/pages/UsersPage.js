import React, { useState, useEffect } from "react";
import NavBar from "../components/Navbar";
import '../styles/userstyles.css'; // Import your CSS file

function UsersPage() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('/users')
          .then(response => response.json())
          .then(data => setUsers(data))
          .catch(error => console.error('Error fetching users:', error));
    }, []);
    
    return (
        <>
            <NavBar />
            <div className="pageContainer">
                <h1 className="heading">Users</h1>
                <div className="tableContainer">
                    <table className="table">
                        <thead className="tableHeader">
                            <tr>
                                <th className="tableCell">ID</th>
                                <th className="tableCell">Username</th>
                                <th className="tableCell">Position</th>
                                <th className="tableCell">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="tableRow">
                                    <td className="tableCell">{user.id}</td>
                                    <td className="tableCell">{user.username}</td>
                                    <td className="tableCell">{user.position}</td>
                                    <td className="tableCell">{user.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default UsersPage;