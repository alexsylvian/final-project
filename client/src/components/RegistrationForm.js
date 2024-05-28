import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";

// Validation schema using Yup
const formSchema = yup.object().shape({
  username: yup.string().required("username is required"),
  position: yup.string().required("position is required"),
});

// Custom hook for handling form logic
function useFormLogic({ initialValues, onSubmit }) {
  const formik = useFormik({
    initialValues,
    validationSchema: formSchema,
    onSubmit: onSubmit,
  });

  return formik;
}

function RegistrationForm({ onRegister }) {
  const formik = useFormLogic({
    initialValues: {
      username: "",
      position: "",
    },
    onSubmit: (values, { resetForm }) => {
      console.log("Form submitted with values:", values);
      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Registration failed");
          }
          return response.json();
        })
        .then((data) => {
          onRegister(data);
          resetForm();
        })
        .catch((error) => {
          console.error("Registration error:", error);
        });
    },
  });

  return (
    <div>
      <h2>New User? Register Here:</h2>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.username && formik.errors.username && (
            <div>{formik.errors.username}</div>
          )}
        </div>
        <div>
          <label htmlFor="position">Position</label>
          <input
            type="text"
            id="position"
            name="position"
            value={formik.values.position}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.position && formik.errors.position && (
            <div>{formik.errors.position}</div>
          )}
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegistrationForm;
