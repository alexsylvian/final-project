import React, { useState } from 'react';

const ProjectForm = ({ addProject }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject = { id: Date.now(), name, subtasks: [] };
    addProject(newProject);
    setName('');

    try {
      const response = await fetch('http://localhost:5555/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add project');
      }
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

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