import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { backendUrl } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      if (loading) return;

      setLoading(true);
      const data = await axios.post(backendUrl + "/api/auth/send-reset-otp", {
        email,
      });
      if (data.status) {
        toast.success(data.message);
        navigate("/reset-password-otp");
      }
      console.log(email);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not send the reset OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen "
    style={{
        background: "linear-gradient(to bottom right, #F7FFF7, #CBFFB0)",
      }}>
      {/* <img
        onClick={() => navigate("/")}
        className="absolute left-5 sm:left-20 top-5 w-10 sm:w-12 cursor-pointer"
        src="/favicon.png"
        alt="favicon"
      /> */}
      <div
        onClick={() => navigate("/")}
        className={`absolute -ml-10 left-5 sm:left-20 top-5 flex flex-col items-center cursor-pointer ${
          loading ? "opacity-50 pointer-events-none" : "cursor-pointer"
        }`}
      >
        <img className="w-10  sm:w-12" src="/favicon.png" alt="favicon" />

        <h1 className="text-2xl sm:text-base mt-1 ml-6">
          <span className="text-gray-800 font-bold">Faith</span>
          <span className="text-green-600 font-extrabold">Fund</span>
        </h1>
      </div>
      <form
        className="bg-gray-300 p-8 rounded-lg shadow-lg w-96 text-sm"
        onSubmit={onSubmitHandler}
      >
        <p className="text-black text-xl">Forgot Password! Don't Worry</p>
        <div className="mb-4 mt-3 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-200">
          <i className="ri-mail-line text-black"></i>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            disabled={loading}
            type="email"
            className="bg-transparent outline-none text-black"
            placeholder="Email Id"
            required
          />
        </div>
        <button className={`w-full py-2.5 rounded-full bg-linear-to-r from-green-300 to-green-700 text-white font-bold text-lg cursor-pointer ${loading ? "cursor-not-allowed  opacity-70" : "cursor-pointer"}`}
        disabled={loading}>
          {loading ? "Please wait..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
