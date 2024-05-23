import React, { useState, useEffect } from 'react';
import NavBar from "../components/Navbar";
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import Login from '../components/Login';

function Home() {
  const [projects, setProjects] = useState([]);
  const [searchedProjects, setSearchedProjects] = useState('');
  const [user, setUser] = useState(null);

  function handleLogin(user) {
    setUser(user);
  }

  useEffect(() => {
    fetch('/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  useEffect(() => {
    fetch("/check_session").then((response) => {
      if (response.ok) {
        response.json().then((user) => setUser(user));
      }
    });
  }, []);

  function handleAddProject(newProject) {
    setProjects([...projects, newProject]);
  }

  function handleSearch(e) {
    setSearchedProjects(e.target.value);
  }

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchedProjects.toLowerCase())
  );


  return (
    <div>
      <NavBar />
      <h1>Welcome to Your Task Manager!</h1>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
      <div>
        <h2>Welcome, {user.username}!</h2>
        <input
          type="text"
          placeholder="Search projects by name"
          value={searchedProjects}
          onChange={handleSearch}
        />
        <h2>Projects</h2>
        <div className="project-cards">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} title={project.name} id={project.id} subtasks={project.subtasks} />
          ))}
        </div>
        <ProjectForm addProject={handleAddProject} />
      </div> )}
    </div>
  );
};

export default Home;