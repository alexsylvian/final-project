import { Link } from "react-router-dom";
import React, { useState } from "react";;

function ProjectCard({ title, id, subtasks, createdAt, dueDate }) {
    const [showSubtasks, setShowSubtasks] = useState(false);

    function toggleSubtasks(){
      setShowSubtasks(!showSubtasks);
    };
  
    return (
        <article className="project-card">
          <h2>{title}</h2>
          <p>{createdAt}</p>
          {showSubtasks && (
            <ul>
              {subtasks.map((subtask, index) => (
                <li key={index}>{subtask}</li>
              ))}
            </ul>
          )}
          <button onClick={toggleSubtasks}>
            {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
          </button>
          <Link to={`/projects/${id}`}>View Project Info</Link>
          <h5>Due: {dueDate}</h5>
        </article>
      );
    }

export default ProjectCard;