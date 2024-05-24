import React, { useState, useEffect } from "react";
import NavBar from "../components/Navbar";
import { useParams } from "react-router-dom";

function ProjectPage() {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams(); // Extracting the project ID from the URL

    console.log("Project ID:", id);

    useEffect(() => {
        setLoading(true)
        fetch(`/project/${id}`) // Making a GET request to fetch project details by ID
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch project');
                }
                return response.json();
            })
            .then(data => {
                setProject(data); // Setting the fetched project details to state
                setLoading(false)
            })
            .catch(error => {
                console.error('Error fetching project:', error);
                setLoading(false)
            });
    }, [id]); // Dependency array ensures this effect runs when the ID changes

    console.log(id)

    return (
        <>
            <NavBar />
            <div>
                <h1>Project Details</h1>
                {loading ? ( // Conditionally render loading indicator while fetching data
                    <p>Loading...</p>
                ) : project ? ( // Conditionally render project details if available
                    <div>
                        <h2>{project.name}</h2>
                        <ul>
                            {project.subtasks.map(subtask => (
                                <li key={subtask}>{subtask}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>Project not found</p> // Render error message if project details are not available
                )}
            </div>
        </>
    );
}
export default ProjectPage;