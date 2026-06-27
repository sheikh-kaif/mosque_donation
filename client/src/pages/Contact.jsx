import React, { useState } from "react";
import Navbar from "../components/Navbar";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_f98zc6m";
const TEMPLATE_ID = "template_67vsxmk";
const PUBLIC_KEY = "jyiXyJiJolqbpzuR7";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          email: formData.email,
          from_name: formData.name,
          message: formData.message,
        },
        PUBLIC_KEY,
      );
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen w-full"
      style={{
        background: "linear-gradient(to bottom right, #F7FFF7, #CBFFB0)",
      }}
    >
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-6 py-12 pt-24 sm:pt-12">
        <div className="w-full max-w-lg">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-700 tracking-wide mb-2">
              Contact Us
            </h1>
            <p className="text-gray-600 text-base">
              Have a question or want to get in touch? I'll love to hear from
              you.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white border border-green-200 rounded-2xl shadow-sm p-10 text-center">
              <div className="text-5xl mb-4">🕌</div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                JazakAllah Khair!
              </h2>
              <p className="text-gray-600 text-base">
                Your message has been received. I'll get back to you soon, In
                sha Allah.
              </p>
              <button
                className="mt-6 px-6 py-2 rounded-full border-2 border-green-500 text-green-700 font-semibold hover:bg-green-100 transition-all"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", message: "" });
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !formData.name ||
                    !formData.email ||
                    !formData.message
                  }
                  className="w-full py-3 rounded-full bg-green-600 text-white font-bold text-base tracking-wide hover:bg-green-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-gray-500 text-sm mt-6">
            We typically respond within 24–48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
