import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import routes from "../routes";
import { UserProvider } from "./UserContext";
function App() {
  return (
    <UserProvider>
      <Router>
        <Switch>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              exact={route.exact}
              render={(props) => {
                console.log("Rendering route:", route.path);
                return <route.component {...props} routes={route.routes} />;
              }}
            />
          ))}
        </Switch>
      </Router>
    </UserProvider>
  );
}

export default App;