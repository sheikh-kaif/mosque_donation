import React, { useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPasswordOtp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const inputRefs = React.useRef([]);

  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContext);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key == "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
       if (loading) return;

      setLoading(true);
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");
      if (otp.length < 6) {
        toast.error("Enter complete OTP");
        return;
      }
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword: password },
      );
      if (data.status) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);

      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="flex items-center justify-center min-h-screen  "
      style={{
        background: "linear-gradient(to bottom right, #F7FFF7, #CBFFB0)",
      }}
    >
      
      <div
        onClick={() => navigate("/")}
        className={`absolute left-5 -ml-10 sm:left-20 top-5 flex flex-col items-center cursor-pointer ${
          loading ? "opacity-50 pointer-events-none" : "cursor-pointer"
        }`}
      >
        <img className="w-10 sm:w-12" src="/favicon.png" alt="favicon" />

        <h1 className="text-2xl sm:text-base mt-1 ml-6">
          <span className="text-gray-800 font-bold">Faith</span>
          <span className="text-green-600 font-extrabold">Fund</span>
        </h1>
      </div>
      <form
        className="bg-gray-300 p-8 rounded-lg shadow-lg w-96 text-sm"
        onSubmit={onSubmitHandler}
      >
        <p className="text-black text-lg font-bold">New Password!</p>
        <div className="mb-4 mt-3 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-200">
          <i className="ri-mail-line text-black"></i>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            disabled={loading}
            type="email"
            className="bg-transparent outline-none text-black "
            placeholder="Email Id"
            required
          />
        </div>
        <p className="text-left mb-6 text-black font-medium">
          Enter the 6-digit code sent to your email id
        </p>
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                disabled={loading}
                required
                className="w-12 h-12 bg-gray-200 text-black text-center text-xl rounded-md"
                ref={(e) => (inputRefs.current[index] = e)}
                // onInput={(e) => handleInput(e, index)}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, ""); // 🔥 only digits
                  handleInput(e, index);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>
        <div className="mb-4 mt-3 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-200 text-black">
          <i className="ri-lock-line"></i>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            disabled={loading}
            type="password"
            className="bg-transparent outline-none  "
            placeholder="New Password"
            required
          />
        </div>
        <button className={`w-full py-3 bg-linear-to-r from-green-300 to-green-700 text-black rounded-full  ${loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`} disabled={loading} >
            {loading ? "Please wait..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordOtp;
