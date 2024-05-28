import React, { useState, useEffect } from 'react';
import NavBar from "../components/Navbar";
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import Login from '../components/Login';
import RegistrationForm from '../components/RegistrationForm';

function Home() {
  const [projects, setProjects] = useState([]);
  const [searchedProjects, setSearchedProjects] = useState('');
  const [user, setUser] = useState(null);
  const [userIdForProjects, setUserIdForProjects] = useState('')
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  useEffect(() => {
    fetch('/users')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  useEffect(() => {
    fetch("/check_session").then((res) => {
      if (res.ok) {
        // console.log(user.username)
        res.json().then((user) => setUser(user));
        // console.log(user.username)
      }
    });
  }, []);

  function handleLogin(user) {
    setUser(user);
    console.log(user.username);
    console.log(user.id);
    setUserIdForProjects(user.id)
  }

  function handleLogout() {
    setUser(null)
  }

  function handleRegister(user) {
    console.log("User registered:", user);
    setUser(user);
    setUsers([...users, user]);
    console.log("Updated user state:", user);
  }

  function handleAddProject(newProject) {
    setProjects([...projects, newProject]);
  }

  function handleSearch(e) {
    setSearchedProjects(e.target.value);
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchedProjects.toLowerCase())
  );

  return (
    <div>
      
      <NavBar onLogout={handleLogout} user={user}/>
      {!user ? (
        <h1>Please Login</h1>
      ) : (
        <h1>Welcome to Your Task Manager, {user.username} ({user.position})!</h1>
      )}
      {!user ? (
        <>
          <Login onLogin={handleLogin} />
          <RegistrationForm onRegister={handleRegister} />
        </>
      ) : (
      <div>
        <p>Hello, {user.username}</p>
        <input
          type="text"
          placeholder="Search projects by name"
          value={searchedProjects}
          onChange={handleSearch}
        />
        <h2>Projects</h2>
        <div className="project-cards">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} title={project.name} id={project.id} subtasks={project.subtasks} createdAt={project.created_at} />
          ))}
        </div>
        <ProjectForm addProject={handleAddProject} />
      </div> )}
    </div>
  );
};

export default Home;