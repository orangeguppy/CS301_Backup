import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import App from "./App";
import EditProfile from "./routes/EditProfile";
import Login from "./routes/Login";
import MyBank from "./routes/MyBank";
import Register from "./routes/Register";
import Validate from "./routes/Validate";
import AccessToken from "./routes/AccessToken";
import AuthToken from "./routes/AuthToken";
import InvalidLogin from "./routes/InvalidLogin";
import InvalidAccess from "./routes/InvalidAccess";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "editprofile",
    element: <EditProfile />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "invalidlogin",
    element: <InvalidLogin />,
  },
  {
    path: "invalidaccess",
    element: <InvalidAccess />,
  },
  {
    path: "mybank",
    element: <MyBank />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "validate",
    element: <Validate />,
  },
  {
    path: "accessToken",
    element: <AccessToken />,
  },
  {
    path: "authToken",
    element: <AuthToken />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);