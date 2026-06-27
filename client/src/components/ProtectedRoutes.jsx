import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedin, loading } = useContext(AppContext);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!isLoggedin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
