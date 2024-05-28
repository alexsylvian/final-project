import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";

const ProjectForm = ({ addProject, userId }) => {
  const formSchema = yup.object().shape({
    name: yup.string().required("Project name is required"),
    dueDate: yup.date().required("Due date is required"),
    userId: yup.number().required("Number is required")
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      dueDate: "",
      userId: ""
    },
    validationSchema: formSchema,
    onSubmit: (values) => {
      fetch("http://localhost:5555/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error('Failed to add project');
          }
        })
        .then((data) => {
          addProject(data);
          formik.resetForm(); // Reset form fields after successful submission
        })
        .catch((error) => {
          console.error("Error adding project:", error);
        });
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit} style={{ margin: "30px" }}>
        <label htmlFor="name">Project Name</label>
        <br />
        <input
          id="name"
          name="name"
          onChange={formik.handleChange}
          value={formik.values.name}
        />
        <p style={{ color: "red" }}> {formik.errors.name}</p>

        <label htmlFor="dueDate">Due Date</label>
        <br />
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          onChange={formik.handleChange}
          value={formik.values.dueDate}
        />
        <p style={{ color: "red" }}> {formik.errors.dueDate}</p>

        <label htmlFor="userId">User Id - Standby</label>
        <br />
        <input
          id="userId"
          name="userId"
          type="number"
          onChange={formik.handleChange}
          value={formik.values.userId}
        />
        <p style={{ color: "red" }}>{formik.errors.userId}</p>
        <button type="submit">Add Project</button>
      </form>
    </div>
  );
};

export default ProjectForm;