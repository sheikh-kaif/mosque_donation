// import React, { useContext, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { AppContext } from "../context/AppContext";
// import axios from "axios";
// import { toast } from "react-toastify";

// const Navbar = () => {
//   const [showMenu, setShowMenu] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { userData, backendUrl, isLoggedin, setIsLoggedin, setUserData } =
//     useContext(AppContext);

//   const sendVerificationOtp = async () => {
//     try {
//       axios.defaults.withCredentials = true;
//       const { data } = await axios.post(
//         backendUrl + "/api/auth/send-verify-otp",
//       );
//       if (data.success) {
//         navigate("/email-verify");
//         toast.success(data.message);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const logout = async () => {
//     try {
//       axios.defaults.withCredentials = true;
//       const { data } = await axios.post(backendUrl + "/api/auth/logout");
//       if (data.success) {
//         setIsLoggedin(false);
//         setUserData(null);
//         navigate("/");
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };
//   const homeNavigation = () => {
//     if (isLoggedin) {
//       navigate("/main");
//     } else {
//       navigate("/");
//     }
//   };
//   return (
//     <div className="w-full  flex justify-between items-center p-2 sm:p-6 sm:pr-16 sm:-mt-1 sm:pl-10 absolute top-0 ">
//       {/* <img src="/favicon.png" alt="logo" className="w-8 sm:w-12" /> */}
//       <div onClick={homeNavigation} className="cursor-pointer">
//         <img src="/favicon.png" alt="logo" className="w-6 sm:w-12" />
//         <h1 className="text-sm sm:text-2xl ">
//           <span className="text-gray-800 font-medium sm:font-bold">Faith</span>
//           <span className="text-green-600 font-bold sm:font-extrabold">
//             Fund
//           </span>
//         </h1>
//       </div>
//       <div className="flex justify-center items-center  gap-1.5 sm:gap-4 text-lg border px-2   sm:px-4 sm:py-1 rounded-full">
//         <ul className="flex gap-1.5 sm:gap-4 justify-center items-center cursor-pointer text-sm sm:text-lg ">
//           <li
//             className={`relative group hover:text-green-600 transition ${
//               location.pathname === "/" || location.pathname === "/main"
//                 ? "text-green-600"
//                 : ""
//             }`}
//             onClick={homeNavigation}
//           >
//             Home
//             <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
//           </li>
//           <li
//             className={`relative group hover:text-green-600 transition ${
//               location.pathname === "/about" ? "text-green-600" : ""
//             }`}
//             onClick={() => navigate("/about")}
//           >
//             About
//             <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
//           </li>
//           <li
//             className={`relative group hover:text-green-600 transition ${
//               location.pathname === "/contact" ? "text-green-600" : ""
//             }`}
//             onClick={() => navigate("/contact")}
//           >
//             Contact
//             <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
//           </li>
//         </ul>
//         {userData ? (
//           <div
//             className="w-8 h-8 flex justify-center items-center  border-2 bg-black text-white cursor-pointer p-4 rounded-full relative group hover:bg-green-200 transition-all hover:text-black "
//             onMouseEnter={() => setShowMenu(true)}
//             onMouseLeave={() => setShowMenu(false)}
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowMenu((prev) => !prev);
//             }}
//           >
//             {userData.name[0].toUpperCase()}

//             {showMenu && (
//               <div className="absolute  top-0 right-0 z-10 text-black rounded pt-10 ">
//                 <ul className="list-none m-0 p-2 bg-gray-50 text-sm">
//                   {!userData.isAccountVerified && (
//                     <li
//                       className="py-1 px-2 hover:bg-gray-200 cursor-pointer rounded"
//                       onClick={sendVerificationOtp}
//                     >
//                       Verify email
//                     </li>
//                   )}

//                   <li
//                     className="py-1 px-2 hover:bg-gray-200 cursor-pointer rounded pr-10"
//                     onClick={logout}
//                   >
//                     Logout
//                   </li>
//                 </ul>
//               </div>
//             )}
//           </div>
//         ) : (
//           <button
//             onClick={() => navigate("/login")}
//             className="relative group flex items-center gap-2 border-gray-500 cursor-pointer rounded-full pxr-3 py-1 text-gray-800 hover:text-green-600 transition-all text-sm sm:text-lg "
//           >
//             Login <i className="ri-arrow-right-line"></i>
//             <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Navbar;

import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, backendUrl, isLoggedin, setIsLoggedin, setUserData } =
    useContext(AppContext);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp",
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not send the verification email. Please try again.",
      );
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      console.log(data);
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate("/");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not log you out. Please try again.",
      );
    }
  };
  const homeNavigation = () => {
    if (isLoggedin) {
      navigate("/main");
    } else {
      navigate("/");
    }
  };
  return (
    <div className="w-full  flex justify-between items-center p-2 sm:p-6 sm:pr-16 sm:-mt-1 sm:pl-10 absolute top-0 ">
      {/* <img src="/favicon.png" alt="logo" className="w-8 sm:w-12" /> */}
      <div onClick={homeNavigation} className="cursor-pointer">
        <img src="/favicon.png" alt="logo" className="w-6 sm:w-12" />
        <h1 className="text-sm sm:text-2xl ">
          <span className="text-gray-800 font-medium sm:font-bold">Faith</span>
          <span className="text-green-600 font-bold sm:font-extrabold">
            Fund
          </span>
        </h1>
      </div>
      <div className="flex justify-center items-center  gap-1.5 sm:gap-4 text-lg border px-2   sm:px-4 sm:py-1 rounded-full">
        <ul className="flex gap-1.5 sm:gap-4 justify-center items-center cursor-pointer text-sm sm:text-lg ">
          <li
            className={`relative group hover:text-green-600 transition ${
              location.pathname === "/" || location.pathname === "/main"
                ? "text-green-600"
                : ""
            }`}
            onClick={homeNavigation}
          >
            Home
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
          </li>
          <li
            className={`relative group hover:text-green-600 transition ${
              location.pathname === "/about" ? "text-green-600" : ""
            }`}
            onClick={() => navigate("/about")}
          >
            About
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
          </li>
          <li
            className={`relative group hover:text-green-600 transition ${
              location.pathname === "/contact" ? "text-green-600" : ""
            }`}
            onClick={() => navigate("/contact")}
          >
            Contact
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
          </li>
        </ul>
        {userData ? (
          <div
            className="w-8 h-8 flex justify-center items-center  border-2 bg-black text-white cursor-pointer p-4 rounded-full relative group hover:bg-green-200 transition-all hover:text-black "
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
          >
            {userData.name[0].toUpperCase()}

            {showMenu && (
              <div className="absolute  top-0 right-0 z-10 text-black rounded ">
                <ul className="list-none m-0 p-2 bg-gray-50 text-sm">
                  {!userData.isAccountVerified && (
                    <li
                      className="py-1 px-2 hover:bg-gray-200 cursor-pointer rounded"
                      onClick={sendVerificationOtp}
                    >
                      Verify email
                    </li>
                  )}

                  {userData.isAdmin && (
                    <li
                      className="py-1 px-2 hover:bg-gray-200 cursor-pointer rounded word-wrap"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/admin");
                      }}
                    >
                      Admin Panel
                    </li>
                  )}

                  <li
                    className="py-1 px-2 hover:bg-gray-200 cursor-pointer rounded pr-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                    }}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="relative group flex items-center gap-2 border-gray-500 cursor-pointer rounded-full pxr-3 py-1 text-gray-800 hover:text-green-600 transition-all text-sm sm:text-lg "
          >
            Login <i className="ri-arrow-right-line"></i>
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
