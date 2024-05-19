import React, { useState } from 'react';

const ProjectForm = ({ addProject }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProject(name);
    setName('');
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