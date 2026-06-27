import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContext);

  const inputRefs = React.useRef([]);

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
      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp },
      );
      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not verify your email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedIn, userData]);

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
        <h1 className="text-black text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-black font-medium">
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
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>
        <button
          className={`w-full py-3 bg-linear-to-r from-green-400 to-green-700 text-white rounded-full ${loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
          disabled={loading}
        >
          {/* Verify email */}{loading ? "Please wait..." : "Verify email"}
        </button>
      </form>
    </div>
  );
};

export default VerifyEmail;
