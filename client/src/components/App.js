import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import routes from "../routes";

function App() {
  return (
    <Router>
      <Switch>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            exact={route.exact}
            render={(props) => (
              <route.component {...props} routes={route.routes} />
            )}
          />
        ))}
      </Switch>
    </Router>
  );
}

export default App;
