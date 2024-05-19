import React, { useState } from 'react';
import NavBar from "../components/Navbar";
import ProjectForm from '../components/ProjectForm';

function Home() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'Clean House', subtasks: ['Clean Kitchen', 'Clean Bedroom', 'Clean Bathroom'] },
    { id: 2, name: 'Project 2', subtasks: [] },
    { id: 3, name: 'Project 3', subtasks: [] }
  ]);

  const addProject = (name) => {
    const newProject = { id: Date.now(), name, subtasks: [] };
    setProjects([...projects, newProject]);
  };

  return (
    <div>
        <NavBar />
      <h1>Welcome to Your Task Manager!</h1>
      <div>
        <h2>Projects</h2>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              {project.name}
              <ul>
                {project.subtasks.map((subtask, index) => (
                  <li key={index}>{subtask}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <ProjectForm addProject={addProject} />
      </div>
    </div>
  );
};

export default Home;