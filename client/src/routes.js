import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import UsersPage from "./pages/UsersPage"
import ErrorPage from "./pages/ErrorPage";

const routes = [
    {
      path: "/",
      element: <Home />,
      errorElement: <ErrorPage />
    },
    {
      path: "/users",
      element: <UsersPage />,
      errorElement: <ErrorPage />
    },
    {
      path: "/project/:id",
      element: <ProjectPage />,
      errorElement: <ErrorPage />
    }
]

export default routes;