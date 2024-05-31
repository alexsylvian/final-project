import React, { useState, useEffect } from "react";
import NavBar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

function ProjectPage() {
    const { id } = useParams();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [currentSubtask, setCurrentSubtask] = useState("")

    const formSchema = yup.object().shape({
        newSubtask: yup.string().required("Subtask name is required"),
    });

    const formik = useFormik({
        initialValues: {
            newSubtask: "",
            creatorId: 0
        },
        validationSchema: formSchema,
        onSubmit: handleAddSubtask,
    });

    useEffect(() => {
        setLoading(true);
        fetch(`/projects/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch project');
                }
                return response.json();
            })
            .then(data => {
                setProject(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching project:', error);
                setLoading(false);
            });
    }, [id]);

    function handleNewSubtaskChange(e) {
        formik.setFieldValue("newSubtask", e.target.value);
    }

    function handleAddSubtask(values) {
        if (values.newSubtask.trim() !== "") {
            const newSubtaskData = {
                name: values.newSubtask.trim(),
                project_id: id,
                creator_id: values.creatorId
            };

            fetch(`/projects/${id}/subtasks`, {
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
                fetch(`/projects/${id}`)
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
                formik.resetForm();
            })
            .catch(error => {
                console.error('Error adding subtask:', error);
            });
        }
    }

    useEffect(() => {
        fetch("/check_session").then((res) => {
            if (res.ok) {
                res.json().then((user) => {
                    setUser(user)
                    formik.setFieldValue("creatorId", user.id);
                });
            }
        });
    }, []);

    function openModal(subtask) {
        setModalOpen(true);
        console.log('open')
        setCurrentSubtask(subtask)
        console.log(subtask)
    }
    
    function closeModal() {
        setModalOpen(false);
        console.log('close')
    }

    function handleSubtaskCompletion(subtaskId, newCompletionStatus) {
        fetch(`/projects/${id}/subtasks/${subtaskId}`, {
            method: 'PATCH', // Use PATCH method for partial updates
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completion_status: newCompletionStatus }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update subtask completion status');
            }
            // Update the completion status of the subtask in the local state
            setProject(prevProject => ({
                ...prevProject,
                subtasks: prevProject.subtasks.map(subtask => {
                    if (subtask.id === subtaskId) {
                        return { ...subtask, completion_status: newCompletionStatus };
                    }
                    return subtask;
                })
            }));
        })
        .catch(error => {
            console.error('Error updating subtask completion status:', error);
        });
    }

    return (
        <>
            <NavBar />
            <div>
                <h1>Project Details</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : project ? (
                    <>
                    <div>
                        <h2>{project.name}</h2>
                        <p>Created {project.created_at}</p>
                        <ul>
                            {project.subtasks.map(subtask => (
                                <React.Fragment key={subtask.id}>
                                    <li>
                                        <input
                                            type="checkbox"
                                            checked={subtask.completion_status}
                                            onChange={() => handleSubtaskCompletion(subtask.id, !subtask.completion_status)}
                                        />
                                        <span>{subtask.name}</span>
                                    </li>
                                    <button onClick={() => openModal(subtask)}>
                                        {modalOpen ? "-" : "+"}
                                    </button>
                                </React.Fragment>
                            ))}
                        </ul>
                        <form onSubmit={formik.handleSubmit}>
                            <input
                                type="text"
                                id="newSubtask"
                                name="newSubtask"
                                value={formik.values.newSubtask}
                                onChange={handleNewSubtaskChange}
                                placeholder="Enter new subtask"
                            />
                            {formik.errors.newSubtask && formik.touched.newSubtask && (
                                <p style={{ color: "red" }}>{formik.errors.newSubtask}</p>
                            )}
                            <button type="submit">Add Subtask</button>
                        </form>
                    </div>

                    <div className={modalOpen ? "modal-open" : "modal"}>
                    <div className="modal-content">
                            <span className="close" onClick={closeModal}>&times;</span>
                            <p>
                                Hello, this is the
                                <br></br> 
                                {currentSubtask.name}
                                <br></br> subtask. 
                                <li>Edit</li>
                                <li>Add User</li>
                                <li>Mark Complete / Incomplete</li>
                                <li>Delete</li>
                            </p>
                        </div>
                    </div>
                    </>
                ) : (
                    <p>Project not found</p>
                )}
            </div>
        </>
    );
}

export default ProjectPage;
