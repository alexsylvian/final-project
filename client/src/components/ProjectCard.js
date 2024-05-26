import { Link } from "react-router-dom";
import React, { useState } from "react";;

function ProjectCard({ title, id, subtasks, createdAt }) {
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
          <Link to={`/project/${id}`}>View Project Info</Link>
        </article>
      );
    }

export default ProjectCard;