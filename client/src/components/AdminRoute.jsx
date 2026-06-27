import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const AdminRoute = ({ children }) => {
  const { isLoggedin, userData, loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        Loading…
      </div>
    );
  }

  if (!isLoggedin) return <Navigate to="/" />;
  if (!userData?.isAdmin) return <Navigate to="/main" />;

  return children;
};

export default AdminRoute;
