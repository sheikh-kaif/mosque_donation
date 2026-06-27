import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import masjid from "../assets/masjid.jpg";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// How a donation's backend status should read to the donor: until an admin
// has actually approved it, it should never look "done" or "verified" -
// only "Waiting" (admin still reviewing) or "Not Approved" (no confirmation yet).
const DONATION_STATUS_LABELS = {
  created: { label: "Not Approved", className: "text-gray-500" },
  awaiting_verification: { label: "Waiting", className: "text-yellow-600" },
  verified: { label: "Approved", className: "text-green-700" },
};

const getDonationStatusDisplay = (status) =>
  DONATION_STATUS_LABELS[status] || {
    label: "Waiting",
    className: "text-yellow-600",
  };

// Simple shimmering placeholder row shown while the donation history loads
const HistoryRowSkeleton = () => (
  <div className="flex justify-between border-b py-2 animate-pulse">
    <span className="h-4 w-12 bg-gray-300/70 rounded" />
    <span className="h-4 w-16 bg-gray-300/70 rounded" />
    <span className="h-4 w-20 bg-gray-300/70 rounded" />
  </div>
);

const Main = () => {
  const [totalDonation, setTotalDonation] = useState(0);
  const [userTotal, setUserTotal] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const { userData, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [displayedLetters, setDisplayedLetters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const totalRes = await axios.get(backendUrl + "/api/donation/total");
        setTotalDonation(totalRes.data.total);

        const userRes = await axios.get(
          backendUrl + "/api/donation/user-total",
          {
            withCredentials: true,
          },
        );
        setUserTotal(userRes.data.total);

        const historyRes = await axios.get(
          backendUrl + "/api/donation/history",
          {
            withCredentials: true,
          },
        );
        setHistory(historyRes.data.donations);
      } catch (error) {
        console.log(error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const word = userData
      ? `As-salamu alaykum, ${userData.name}!`
      : "As-salamu alaykum";

    let i = 0;
    let timeoutId;
    let intervalId;

    const startTyping = () => {
      i = 0;
      setDisplayedLetters([]);

      intervalId = setInterval(() => {
        if (i < word.length) {
          const currentLetter = word[i];
          setDisplayedLetters((prev) => [...prev, currentLetter]);
          i++;
        } else {
          clearInterval(intervalId);
          timeoutId = setTimeout(startErasing, 2000);
        }
      }, 150);
    };

    const startErasing = () => {
      intervalId = setInterval(() => {
        setDisplayedLetters((prev) => {
          if (prev.length === 0) {
            clearInterval(intervalId);
            timeoutId = setTimeout(startTyping, 500);
            return prev;
          }
          return prev.slice(0, -1);
        });
      }, 80);
    };

    startTyping();

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [userData]);
  const [enabled, setEnabled] = useState(false);

 
  useEffect(() => {
    const fetchReminderStatus = async () => {
      try {
        const res = await axios.get(backendUrl + "/api/user/reminder-status", {
          withCredentials: true,
        });
        setEnabled(res.data.reminderEnabled);
      } catch (error) {
        console.log(error);
      }
    };
    fetchReminderStatus();
  }, []);

  const toggleReminder = async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    try {
      await axios.put(
        backendUrl + "/api/user/reminder",
        { reminderEnabled: newValue },
        { withCredentials: true },
      );
    } catch (error) {
      console.log(error);
      setEnabled(!newValue); 
    }
  };

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen w-full pt-20 lg:pt-0"
      style={{
        background: "linear-gradient(to bottom right, #F7FFF7, #CBFFB0)",
      }}
    >
      <Navbar />

      <div className="flex flex-col items-center w-full lg:w-3/5 justify-center px-4 text-center text-gray-800 pb-10 lg:pb-0">
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-san mb-4 lg:mb-6 tracking-widest text-green-700"
          style={{ minHeight: "2.5rem" }}
        >
          {displayedLetters.map((letter, index) => (
            <span
              key={index}
              className="inline-block animate-bounce-in"
              style={{
                opacity: 1,
                animation: "fadeSlideIn 0.4s ease forwards",
                color: index < 18 ? "text-green-700" : "black",
                fontWeight: index < 18 ? "800" : "400",
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </h1>

        <p className="max-w-md text-base sm:text-lg lg:text-xl text-center font-medium mb-6">
          WHATEVER YOU GIVE IN CHARITY IS CERTAINLY WELL KNOWN TO ALLAH{" "}
          <span className="text-green-700 ml-2">[2:273]</span>
        </p>

        <div className="mb-6">
          <p className="font-medium text-base sm:text-lg lg:text-xl">
            Total Donation <span className="ml-2">{totalDonation}</span>
          </p>
          <p className="font-medium text-base sm:text-lg lg:text-xl">
            Your Total Contribution <span className="ml-2">{userTotal}</span>
          </p>
        </div>

        <p className="text-base sm:text-lg lg:text-xl font-bold mb-8">
          Be a part of
          <span className="text-red-500 text-xl sm:text-2xl lg:text-3xl font-extrabold"> الخير </span>
          Your small contribution can make a big difference.
        </p>
        {/* <button
          className="border px-4 py-1 rounded-full cursor-pointer"
          onClick={toggleReminder}
        >
          friday reminder
        </button> */}
        <div className="flex gap-4 text-base sm:text-lg lg:text-xl font-medium justify-center items-center">
        <p>Remind me on Fridays</p>
        <button
  className={`relative inline-flex mt-0.5 h-6 w-11 items-center rounded-full transition-colors duration-300 ${
    enabled ? "bg-green-500" : "bg-gray-300"
  }`}
  onClick={toggleReminder}
>
  <span
    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
      enabled ? "translate-x-6" : "translate-x-1"
    }`}
  />
</button>
</div>
      </div>

      
      <div className="w-full lg:w-2/5 relative min-h-[60vh] lg:h-[80vh] lg:mt-25 lg:mr-10 px-4 lg:px-0 pb-10 lg:pb-0">
        
        <div
          className="absolute inset-0 z-0 rounded-2xl lg:rounded-none"
          style={{
            backgroundImage: `url(${masjid})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            mixBlendMode: "multiply",
            opacity: 0.7,
            filter: "blur(4px)",
          }}
        />

        
        <div className="relative z-10 flex flex-col items-center pt-8 lg:mt-10 h-full">
          <div className="mt-6 w-full max-w-md px-4 lg:px-0 lg:mr-40">
            {/* {history.length === 0 ? (
              <p className="text-gray-600 text-center text-xl font-medium">
                No donations yet. Make your first contribution today and track
                your impact.
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between border-b py-2"
                >
                  <span>₹{item.amount}</span>
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              ))
            )} */}
            {historyLoading ? (
              <>
                <div className="flex justify-between border-b pb-2 mb-2 font-semibold text-gray-700">
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                <HistoryRowSkeleton />
                <HistoryRowSkeleton />
                <HistoryRowSkeleton />
              </>
            ) : history.length === 0 ? (
              <p className="text-gray-600 text-center text-base sm:text-lg lg:text-xl font-medium">
                No donations yet. Make your first contribution today and track
                your impact.
              </p>
            ) : (
              <>
               
                <div className="flex justify-between border-b pb-2 mb-2 font-semibold text-gray-700">
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>

                
                {history.map((item) => {
                  const statusDisplay = getDonationStatusDisplay(item.status);
                  return (
                    <div
                      key={item._id}
                      className="flex justify-between border-b py-2"
                    >
                      <span>₹{item.amount}</span>
                      <span className={`font-medium ${statusDisplay.className}`}>
                        {statusDisplay.label}
                      </span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <button
            className="border-2 border-green bg-green-200 text-green-900 font-bold text-base sm:text-lg lg:text-xl rounded-full px-6 sm:px-8 py-2 mt-8 lg:mr-40 transition-all duration-200 hover:bg-gray-100 cursor-pointer hover:scale-105"
            onClick={() => navigate("/donate")}
          >
            Donate
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;
