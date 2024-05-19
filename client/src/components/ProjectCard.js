import { Link } from "react-router-dom";

function ProjectCard({ title, id }){
    return(
        <article>
            <h2>{title}</h2>
            <Link to={`/project/${id}`}>View Project Info</Link>
        </article>
    )
}

export default ProjectCard