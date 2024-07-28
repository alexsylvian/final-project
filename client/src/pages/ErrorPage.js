import React from "react";
import NavBar from "../components/Navbar";
import styles from '../styles/ErrorPage.module.css'; // Import the CSS module

function ErrorPage({ errorCode }) {
  return (
    <div className={styles.container}>
      <NavBar />
      <div className="text-center mt-10">
        <h2 className={styles.heading}>Error {errorCode}</h2>
        <p className={styles.message}>Sorry, something went wrong.</p>
      </div>
    </div>
  );
}

export default ErrorPage;