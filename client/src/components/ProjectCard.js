import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../styles/projectCardStyles.css'; // Import the CSS file

function ProjectCard({ title, id, subtasks, createdAt, dueDate, completed }) {
    const [showSubtasks, setShowSubtasks] = useState(false);

    function toggleSubtasks() {
      setShowSubtasks(!showSubtasks);
    }

    const completionStatusClass = completed ? 'completed' : 'incomplete';

    return (
        <article className={`project-card ${completionStatusClass}`}>
          <h2>{title}</h2>
          <p>Created At: {createdAt}</p>
          {showSubtasks && (
            <ul>
              {subtasks.map((subtask) => (
                <li key={subtask.id}>
                  {subtask.name} - {subtask.completion_status ? 'Complete' : 'Incomplete'}
                </li>
              ))}
            </ul>
          )}
          <button onClick={toggleSubtasks}>
            {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
          </button>
          <h5>
            {completed ? "All tasks complete" : "Some tasks incomplete"}
          </h5>
          <Link to={`/projects/${id}`}>View Project Info</Link>
          <h5>Due: {dueDate}</h5>
        </article>
    );
}

export default ProjectCard;