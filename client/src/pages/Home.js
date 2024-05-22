import React, { useState } from 'react';
import NavBar from "../components/Navbar";
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';

function Home() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'Clean House', subtasks: ['Clean Kitchen', 'Clean Bedroom', 'Clean Bathroom'] },
    { id: 2, name: 'Project 2', subtasks: [] },
    { id: 3, name: 'Project 3', subtasks: [] }
  ]);

  function addProject(name) {
    const newProject = { id: Date.now(), name, subtasks: [] };
    setProjects([...projects, newProject]);
  };

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
        <ProjectForm addProject={addProject} />
      </div>
    </div>
  );
};

export default Home;