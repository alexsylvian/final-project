import Home from "./pages/Home"
import ProjectPage from "./pages/ProjectPage";
import UsersPage from "./pages/UsersPage"
// import ErrorPage from "./pages/ErrorPage";

const routes = [
    {
      path: "/",
      component: Home,
      exact: true,
    //   errorElement: <ErrorPage />
    },
    {
      path: "/users",
      component: UsersPage,
      exact: true,
    //   errorElement: <ErrorPage />
    },
    {
      path: "/projects/:id",
      component: ProjectPage,
      exact: true
      // errorElement: <ErrorPage />
    }
]

export default routes;