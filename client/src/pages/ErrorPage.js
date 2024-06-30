import React from "react";
import NavBar from "../components/Navbar";

function ErrorPage({ errorCode }) {
  return (
    <div>
        <NavBar />
        <h2>Error {errorCode}</h2>
        <p>Sorry, something went wrong.</p>
    </div>
  );
};

export default ErrorPage;