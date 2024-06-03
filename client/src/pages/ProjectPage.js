import React, { useState, useEffect } from "react";
import NavBar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import "../styles.css";

function ProjectPage() {
    const { id } = useParams();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([])
    const [modalOpen, setModalOpen] = useState(false);
    const [currentSubtask, setCurrentSubtask] = useState("")
    const [userToBeAdded, setUserToBeAdded] = useState(null)

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
                if (user) {
                    formik.setFieldValue("creatorId", user.id);
                }
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
                    setUser(user);
                    if (user) {
                        formik.setFieldValue("creatorId", user.id);
                    }
                });
            }
        });
    }, [project]);

    useEffect(() => {
        fetch("/users")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                return response.json();
            })
            .then(data => {
                setUsers(data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
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
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completion_status: newCompletionStatus }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update subtask completion status');
            }
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

    function handleDeleteSubtask(subtaskId) {
        if (window.confirm("Are you sure you want to delete this subtask?")) {
            fetch(`/projects/${id}/subtasks/${subtaskId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete subtask');
                }
                setProject(prevProject => ({
                    ...prevProject,
                    subtasks: prevProject.subtasks.filter(subtask => subtask.id !== subtaskId)
                }));
            })
            .catch(error => {
                console.error('Error deleting subtask:', error);
            });
        }
    }

    function handleUserSelection(event) {
        setUserToBeAdded(event.target.value);
    }

    function addUserToSubtask(subtaskId) {
        const subtask = project.subtasks.find(subtask => subtask.id === subtaskId);
        const isUserAlreadyAttached = subtask.users_attached.some(user => user.id === parseInt(userToBeAdded));

        if (isUserAlreadyAttached) {
            alert("This user is already associated with the subtask");
            return;
        }

        setProject(prevProject => {
            const updatedProject = { ...prevProject };
            const updatedSubtasks = updatedProject.subtasks.map(subtask => {
                if (subtask.id === subtaskId) {
                    const newUser = users.find(user => user.id === userToBeAdded);
                    if (newUser) {
                        return {
                            ...subtask,
                            users_attached: [
                                ...subtask.users_attached,
                                { id: newUser.id, username: newUser.username }
                            ]
                        };
                    } else {
                        return subtask;
                    }
                }
                return subtask;
            });
            updatedProject.subtasks = updatedSubtasks;
            return updatedProject;
        });
    
        closeModal();

        fetch(`/subtasks/${subtaskId}/add_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userToBeAdded }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add user to subtask');
            }
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
        })
        .catch(error => {
            console.error('Error adding user to subtask:', error);
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
                            <div key={subtask.id} className="subtask-container">
                            <div className="subtask">
                                <h3>{subtask.name}</h3>
                                <p>Mark Complete/Incomplete:</p>
                                <input
                                    type="checkbox"
                                    checked={subtask.completion_status}
                                    onChange={() => handleSubtaskCompletion(subtask.id, !subtask.completion_status)}
                                />
                                <p className="bold-text">Users Responsible for this Subtask:</p>
                                <ul>
                                    {subtask.users_attached.map(user => (
                                        <li key={user.id}>{user.username}</li>
                                    ))}
                                </ul>
                                <button onClick={() => handleDeleteSubtask(subtask.id)}>❌</button>
                            </div>
                            <button onClick={() => openModal(subtask)}>
                                {modalOpen ? "-" : "+"}
                            </button>
                        </div>
                        ))}
                        </ul>
                        <h5>Due: {project.due_date}</h5>
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
                                <div>
                                    Please select user to add to the {currentSubtask.name} subtask. 
                                    <ul>
                                        <li>
                                            Add User: 
                                            <select onChange={handleUserSelection}>
                                                <option value="">Select User</option>
                                                {users.map(user => (
                                                    <option key={user.id} value={user.id}>{user.username}</option>
                                                ))}
                                            </select>
                                            <button onClick={() => addUserToSubtask(currentSubtask.id)}>Add User</button>
                                        </li>
                                    </ul>
                                </div>
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
