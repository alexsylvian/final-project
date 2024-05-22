import React, { useState, useEffect } from 'react';
import NavBar from "../components/Navbar";
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';

function Home() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  function handleAddProject(newProject) {
    setProjects([...projects, newProject]);
  }

  return (
    <div>
        <NavBar />
      <h1>Welcome to Your Task Manager!</h1>
      <div>
        <h2>Projects</h2>
        <div className="project-cards">
          {/* Render ProjectCard components for each project */}
          {projects.map((project) => (
            <ProjectCard key={project.id} title={project.name} id={project.id} subtasks={project.subtasks} />
          ))}
        </div>
        <ProjectForm addProject={handleAddProject} />
      </div>
    </div>
  );
};

export default Home;