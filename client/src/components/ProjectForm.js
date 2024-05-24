import React, { useState } from 'react';

function ProjectForm ({ addProject }) {
  const [name, setName] = useState('');

  function handleSubmit(e){
    e.preventDefault();
    if (!name.trim()) return;

    // const newProject = { name, subtasks: [] };
    // addProject(newProject);
    // setName('');
  
    fetch('http://localhost:5555/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to add project');
        }
        return res.json();
      })
      .then((data) => {
        addProject(data);
        setName('');
      })
      .catch((error) => {
        console.error('Error adding project:', error);
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Add Project</button>
    </form>
  );
};

export default ProjectForm;