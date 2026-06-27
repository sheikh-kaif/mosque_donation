import React, { useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
const home = () => {
  const { isLoggedin, loading } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isLoggedin) {
      navigate("/main"); // 🔥 redirect to main page
    }
  }, [isLoggedin, loading]);
  
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen  bg-cover bg-center"
      style={{
        background: "linear-gradient(to bottom right, #F7FFF7, #CBFFB0)",
      }}
    >
      <Navbar />
      <Header />
    </div>
  );
};

export default home;

