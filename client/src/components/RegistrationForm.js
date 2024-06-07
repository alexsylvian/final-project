import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";

const formSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  position: yup.string().required("Position is required"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: yup.string().required("Confirm Password is required").oneOf([yup.ref('password'), null], 'Passwords must match')
});

function useFormLogic({ initialValues, onSubmit }) {
  const formik = useFormik({
    initialValues,
    validationSchema: formSchema,
    onSubmit: onSubmit,
  });

  return formik;
}

function RegistrationForm({ onRegister }) {
  const [serverError, setServerError] = useState("");

  const formik = useFormLogic({
    initialValues: {
      username: "",
      position: "",
      password: "",
      confirmPassword: ""
    },
    onSubmit: (values, { resetForm }) => {
      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Registration failed");
        }
        return response.json();
      })
      .then(data => {
        onRegister(data);
        resetForm();
      })
      .catch(error => {
        console.error("Registration error:", error);
        setServerError("Registration failed. Please try again.");
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
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.password && formik.errors.password && (
            <div>{formik.errors.password}</div>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div>{formik.errors.confirmPassword}</div>
          )}
        </div>
        {serverError && <div>{serverError}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegistrationForm;
