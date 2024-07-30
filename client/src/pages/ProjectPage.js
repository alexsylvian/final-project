import React, { useState, useEffect } from "react";
import NavBar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

import '../styles/projectPageStyles.css';

function ProjectPage() {
    const { id } = useParams();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([])
    const [modalOpen, setModalOpen] = useState(false);
    const [currentSubtask, setCurrentSubtask] = useState("")
    const [userToBeAdded, setUserToBeAdded] = useState(null)
    const [priority, setPriority] = useState("low");
    const [commentInputs, setCommentInputs] = useState({});
    const [visibleComments, setVisibleComments] = useState({});

    const formSchema = yup.object().shape({
        newSubtask: yup.string()
            .matches(/^[a-zA-Z\s]+$/, 'Subtask name must contain only letters and spaces')
            .required("Subtask name is required"),
        creatorId: yup.number().required('Creator ID is required'),
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
        setCurrentSubtask(subtask)
    }
    
    function closeModal() {
        setModalOpen(false);
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

        const payload = {
            user_id: userToBeAdded,
            priority: priority
        };

        fetch(`/subtasks/${subtaskId}/add_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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

    function handlePriorityChange(e) {
        setPriority(e.target.value);
    }

    function handleAddComment(subtaskId) {
        const commentText = commentInputs[subtaskId] || '';
    
        if (commentText.trim()) {
            fetch(`/subtasks/${subtaskId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: commentText,
                    username: user.username, // Replace `user.username` with the actual current user data
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add comment');
                }
                return response.json();
            })
            .then(newComment => {
                setProject(prevProject => {
                    const updatedProject = { ...prevProject };
                    const updatedSubtasks = updatedProject.subtasks.map(subtask => {
                        if (subtask.id === subtaskId) {
                            return {
                                ...subtask,
                                comments: [...subtask.comments, newComment]
                            };
                        }
                        return subtask;
                    });
                    updatedProject.subtasks = updatedSubtasks;
                    return updatedProject;
                });
                setCommentInputs(''); // Clear input field
            })
            .catch(error => {
                console.error('Error adding comment:', error);
            });
        } else {
            console.warn('Comment text is empty');
        }
    };
    
    function toggleCommentsVisibility(subtaskId) {
        setVisibleComments(prevVisibility => ({
            ...prevVisibility,
            [subtaskId]: !prevVisibility[subtaskId]
        }));
    };

    return (
        <>
            <NavBar />
            <div className="project-page">
                <h1>Project Details</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : project ? (
                    <>
                        <div className="project-details">
                            <h2>{project.name}</h2>
                            <p>Created on {project.created_at}</p>
                            <ul className="subtasks-list">
                                {project.subtasks.map(subtask => (
                                    <div key={subtask.id} className={`subtask-container ${subtask.completion_status ? 'faded' : ''}`}>
                                        <div className="subtask">
                                            <h3>{subtask.name}</h3>
                                            <p className="bold-text">Users Responsible for this Subtask:</p>
                                            <ul className="attached-users">
                                                {subtask.users_attached.map(attachedUser => (
                                                    <li key={attachedUser.user.id}>
                                                        {attachedUser.user.username} - Priority: 
                                                        <span className={`priority-${attachedUser.priority}`}>
                                                            {attachedUser.priority.toUpperCase()}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="comment-section">
                                                <button onClick={() => toggleCommentsVisibility(subtask.id)}>
                                                    {visibleComments[subtask.id] ? 'Hide Comments' : 'Show Comments'}
                                                </button>
    
                                                {visibleComments[subtask.id] && (
                                                    <>
                                                        <h4>Comments</h4>
                                                        <ul>
                                                            {subtask.comments && subtask.comments.map(comment => (
                                                                <li key={comment.id}>
                                                                    <p>{comment.text}</p>
                                                                    <p><i>by {comment.username} on {new Date(comment.created_at).toLocaleString()}</i></p>
                                                                </li>
                                                            ))}
                                                        </ul>
    
                                                        <input
                                                            type="text"
                                                            value={commentInputs[subtask.id] || ''}
                                                            onChange={e => setCommentInputs(prev => ({
                                                                ...prev,
                                                                [subtask.id]: e.target.value
                                                            }))}
                                                            placeholder="Add a comment"
                                                        />
                                                        <button onClick={() => handleAddComment(subtask.id)} className="add-comment-button">
                                                            Add Comment
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            
                                            <button onClick={() => handleDeleteSubtask(subtask.id)} className="delete-subtask-button">❌</button>
                                        </div>
                                        <button onClick={() => openModal(subtask)} className="assign-user-button">
                                            {modalOpen ? "-" : "Add User"}
                                        </button>
                                        <div className="mark-complete">
                                            <p>Mark Complete/Incomplete:</p>
                                            <input
                                                type="checkbox"
                                                checked={subtask.completion_status}
                                                onChange={() => handleSubtaskCompletion(subtask.id, !subtask.completion_status)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </ul>
                            <h5>Due: {project.due_date}</h5>
                            <form onSubmit={formik.handleSubmit} className="add-subtask-form">
                                <input
                                    type="text"
                                    id="newSubtask"
                                    name="newSubtask"
                                    value={formik.values.newSubtask}
                                    onChange={handleNewSubtaskChange}
                                    placeholder="Enter new subtask"
                                />
                                {formik.errors.newSubtask && formik.touched.newSubtask && (
                                    <p className="error-text">{formik.errors.newSubtask}</p>
                                )}
                                <button type="submit">Add Subtask</button>
                            </form>
                        </div>
    
                        <div className={`modal ${modalOpen ? 'modal-open' : ''}`}>
                            <div className="modal-content">
                                <span className="close" onClick={closeModal}>&times;</span>
                                <div className="modal-body">
                                    <p>Please select user to add to the {currentSubtask.name} subtask.</p>
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
                                        <li>
                                            Priority:
                                            <select value={priority} onChange={handlePriorityChange}>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="severe">Severe</option>
                                            </select>
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