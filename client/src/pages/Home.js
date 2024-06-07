import React, { useState, useEffect } from 'react';
import NavBar from "../components/Navbar";
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import Login from '../components/Login';
import RegistrationForm from '../components/RegistrationForm';

function Home() {
  const [projects, setProjects] = useState([]);
  const [searchedProjects, setSearchedProjects] = useState('');
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [warningData, setWarningData] = useState('');

  useEffect(() => {
    if (user) {
      fetch('/projects')
        .then(response => response.json())
        .then(console.log("anything?"))
        .then(data => {
          console.log(data)
          const projectsWithCompletion = data.map(project => ({
            ...project,
            completed: project.subtasks.every(subtask => subtask.completion_status)
          }));
          setProjects(projectsWithCompletion);
          console.log("data received")
        })
        .catch(error => console.error('Error fetching projects:', error));
    }
  }, [user]);

  useEffect(() => {
    fetch('/users')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  useEffect(() => {
    fetch("/check_session").then((res) => {
      console.log("earlier check session")
      if (res.ok) {
        res.json().then((user) => {
          console.log('check session')
          setUser(user)
          console.log(user.username)
        })
      }
    });
  }, []);

  function handleLogin(user) {
    if (user.username) {
      setUser(user);
      console.log(user.username);
      console.log(user.id);
    } else {
      setWarningData("Wrong Username or Password");
      document.getElementById('warning').style.color = 'red';
      setTimeout(() => {
        setWarningData("");
      }, 10000);
    }
  }

  function handleLogout() {
    setUser(null)
  }

  function handleRegister(user) {
    console.log("User registered:", user);
    setUser(user);
    setUsers([...users, user]);
    console.log("Updated user state:", user);
  }

  function handleAddProject(newProject) {
    setProjects([...projects, { ...newProject, completed: false }]);
  }

  function handleSearch(e) {
    setSearchedProjects(e.target.value);
  }

  function toggleProjectCompletion(projectId) {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? {
              ...project,
              completed: project.subtasks.every(subtask => subtask.completion_status)
          }
          : project
      )
    );
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchedProjects.toLowerCase())
  );

  return (
    <div>
      <NavBar onLogout={handleLogout} user={user}/>
      {!user ? (
        <h1>Please Login</h1>
      ) : (
        <h1>Welcome to Your Task Manager, {user.username} ({user.position})!</h1>
      )}
      {!user ? (
        <>
          <Login onLogin={handleLogin} />
          <p id='warning'>{warningData}</p>
          <RegistrationForm onRegister={handleRegister} />
        </>
      ) : (
      <div>
        <input
          type="text"
          placeholder="Search projects by name"
          value={searchedProjects}
          onChange={handleSearch}
        />
        <h2>Projects</h2>
        <div className="project-cards">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.name}
              id={project.id}
              subtasks={project.subtasks.map((subtask) => subtask)}
              createdAt={project.created_at}
              dueDate={project.due_date}
              completed={project.completed}
              onToggleCompletion={toggleProjectCompletion}
            />
          ))}
        </div>
        <ProjectForm addProject={handleAddProject} userIdForProjects={user.id} />
      </div> )}
    </div>
  );
};

export default Home;
