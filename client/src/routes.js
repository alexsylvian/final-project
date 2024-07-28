import Home from "./pages/Home"
import ProjectPage from "./pages/ProjectPage";
import UsersPage from "./pages/UsersPage"
import ErrorPage from "./pages/ErrorPage";
import ProfilePage from "./pages/ProfilePage";
import CalendarPage from "./pages/CalendarPage";

const routes = [
    {
      path: "/",
      component: Home,
      exact: true,
      errorElement: <ErrorPage />
    },
    {
      path: "/users",
      component: UsersPage,
      exact: true,
      errorElement: <ErrorPage />
    },
    {
      path: "/projects/:id",
      component: ProjectPage,
      exact: true,
      errorElement: <ErrorPage />
    },
    {
      path: "/users/:id",
      component: ProfilePage,
      exact: true,
      errorElement: <ErrorPage />
    },
    {
      path: "/calendar",
      component: CalendarPage,
      exact: true,
      errorElement: <ErrorPage />
    },
    {
      path: "*",
      component: ErrorPage,
      exact: false
    }
]

export default routes;