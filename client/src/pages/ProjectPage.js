import React, { useState, useEffect } from "react";
import NavBar from "../components/Navbar";
import { useParams } from "react-router-dom";

function ProjectPage() {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newSubtask, setNewSubtask] = useState("");
    const { id } = useParams(); // Extracting the project ID from the URL

    useEffect(() => {
        setLoading(true)
        fetch(`/project/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch project');
                }
                return response.json();
            })
            .then(data => {
                setProject(data);
                setLoading(false)
            })
            .catch(error => {
                console.error('Error fetching project:', error);
                setLoading(false)
            });
    }, [id]);

    function handleNewSubtaskChange(e){
        setNewSubtask(e.target.value);
    };

    function handleAddSubtask(e){
        e.preventDefault();
        if (newSubtask.trim() !== "") {
            const newSubtaskData = {
                name: newSubtask.trim(),
                project_id: id
            };
    
            fetch(`/project/${id}/subtasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSubtaskData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add subtask');
                }
                return response.json();
            })
            .then(() => {
                fetch(`/project/${id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch project');
                        }
                        return response.json();
                    })
                    .then(data => {
                        setProject(data);
                    })
                    .catch(error => {
                        console.error('Error fetching project:', error);
                    });
                setNewSubtask("");
            })
            .catch(error => {
                console.error('Error adding subtask:', error);
            });
        }
    }

    return (
        <>
            <NavBar />
            <div>
                <h1>Project Details</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : project ? (
                    <div>
                        <h2>{project.name}</h2>
                        <ul>
                            {project.subtasks.map(subtask => (
                                <li key={subtask}>{subtask}</li>
                            ))}
                        </ul>
                        {/* Form for adding new subtasks */}
                        <form onSubmit={handleAddSubtask}>
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={handleNewSubtaskChange}
                                placeholder="Enter new subtask"
                            />
                            <button type="submit">Add Subtask</button>
                        </form>
                    </div>
                ) : (
                    <p>Project not found</p>
                )}
            </div>
        </>
    );
}

export default ProjectPage;