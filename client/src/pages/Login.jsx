import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      if (loading) return;

      setLoading(true);
      axios.defaults.withCredentials = true;
      if (state === "Sign Up") {
        console.log(backendUrl);

        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });
        if (data.status) {
          setIsLoggedin(true);

          getUserData();
          navigate("/main");
        } else {
          toast.error(data.message);
        }
      } else {
        console.log(backendUrl);
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });
        if (data.status) {
          setIsLoggedin(true);

          getUserData();
          navigate("/main");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(true);

    // auto hide after 1 second
    setTimeout(() => {
      setShowPassword(false);
    }, 1000);
  };
  return (
    <div
      className="flex items-center justify-center  min-h-screen px-6 sm:px-0 "
      style={{
        background: "linear-gradient(to bottom right, #F7FFF7, #CBFFB0)",
      }}
    >
      <div
        onClick={() => navigate("/")}
        className={`absolute left-5 -ml-10 sm:left-20 top-5 flex flex-col items-center ${
          loading ? "opacity-50 pointer-events-none" : "cursor-pointer"
        }`}
      >
        <img className="w-10 sm:w-12" src="/favicon.png" alt="favicon" />

        <h1 className="text-2xl sm:text-base mt-1 ml-6">
          <span className="text-gray-800 font-bold">Faith</span>
          <span className="text-green-600 font-extrabold">Fund</span>
        </h1>
      </div>
      <div className="bg-gray-300 p-10 rounded-lg shadow-lg w-full sm:w-96 text-black text-sm">
        <h2 className="text-3xl font-semibold text-black text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>

        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-200">
              <i className="ri-user-line"></i>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                disabled={loading}
                type="text"
                className="bg-transparent outline-none"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-200">
            <i className="ri-mail-line"></i>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              disabled={loading}
              type="email"
              className="bg-transparent outline-none "
              placeholder="Email Id"
              required
            />
          </div>

          <div className="mb-4 flex items-center gap-4 w-full px-5 py-2.5 rounded-full bg-gray-200">
            <i className="ri-lock-line"></i>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              disabled={loading}
              type={showPassword ? "text" : "password"}
              className="bg-transparent outline-none"
              placeholder="Password"
              required
            />
            <div className="relative group">
              <i
                className={`cursor-pointer ${
                  showPassword ? "ri-eye-off-line" : "ri-eye-line"
                }`}
                onClick={handleTogglePassword}
              ></i>

              <span className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-200 text-black text-xs px-2 py-1 rounded whitespace-nowrap">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </div>
          </div>
          <p
            className={`mb-4 text-green-900 ${loading ? "opacity-50 pointer-events-none" : "cursor-pointer"} `}
            onClick={() => navigate("/reset-password")}
          >
            Forgot Password
          </p>
          <button
            className={`w-full py-2.5 rounded-full bg-linear-to-r from-green-300 to-green-700 text-white font-medium  ${loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            disabled={loading}
          >
            {loading ? "Please wait..." : state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-black text-center text-s mt-4">
            Already have an account?{" "}
            <span
              className={`text-green-900 underline ${
                loading ? "opacity-50 pointer-events-none" : "cursor-pointer"
              }`}
              onClick={() => setState("Login")}
            >
              Login Here
            </span>
          </p>
        ) : (
          <p className="text-black text-center text-s mt-4">
            Dont have an account?{" "}
            <span
              className={`text-green-900 underline ${
                loading ? "opacity-50 pointer-events-none" : "cursor-pointer"
              }`}
              onClick={() => setState("Sign Up")}
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
