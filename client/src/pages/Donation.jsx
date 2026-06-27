import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import { AppContext } from "../context/AppContext";

const isMobileDevice =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const Donation = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  // step: "form" -> enter amount | "pay" -> show QR / UPI link | "done" -> thank you
  const [step, setStep] = useState("form");
  const [money, setMoney] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [payment, setPayment] = useState(null); // { reference, amount, upiId, payeeName, upiLink }
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [utr, setUtr] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  // Step 1: create a donation record + UPI link, then render its QR code
  const handleCreateDonation = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg("");
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/donation/create", {
        amount: Number(money),
      });

      if (!data.status) {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
        return;
      }

      const qr = await QRCode.toDataURL(data.upiLink, {
        margin: 1,
        width: 280,
      });

      setPayment(data);
      setQrDataUrl(qr);
      setStep("pay");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          "Could not start the payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Opens the UPI app chooser directly (works on mobile where a UPI app is installed)
  const openUpiApp = () => {
    if (!payment) return;
    window.location.href = payment.upiLink;
  };

  const copyUpiId = async () => {
    if (!payment) return;
    try {
      await navigator.clipboard.writeText(payment.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available, ignore silently
    }
  };

  // Step 2: donor confirms they've paid (there is no gateway to auto-detect this)
  const handleConfirmPayment = async () => {
    if (confirming || !payment) return;
    setConfirming(true);
    setErrorMsg("");
    try {
      await axios.post(backendUrl + "/api/donation/confirm", {
        reference: payment.reference,
        utr,
      });
      setStep("done");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          "Could not record your confirmation. Please try again."
      );
    } finally {
      setConfirming(false);
    }
  };

  const resetFlow = () => {
    setStep("form");
    setMoney("");
    setPayment(null);
    setQrDataUrl("");
    setUtr("");
    setErrorMsg("");
  };

  const isBusy = loading;

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 sm:px-6 py-10"
      style={{
        background: "linear-gradient(to bottom right, #F7FFF7, #CBFFB0)",
      }}
    >
      <div
        onClick={() => navigate("/")}
        className={`absolute left-4 sm:left-8 top-4 sm:top-5 flex items-center gap-2 ${
          isBusy ? "opacity-50 pointer-events-none" : "cursor-pointer"
        }`}
      >
        <img className="w-8 sm:w-12" src="/favicon.png" alt="favicon" />
        <h1 className="text-base sm:text-2xl">
          <span className="text-gray-800 font-bold">Faith</span>
          <span className="text-green-600 font-extrabold">Fund</span>
        </h1>
      </div>

      <div className="bg-gray-300 p-6 sm:p-10 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md text-black text-center text-sm mt-16 sm:mt-0">
        {step === "form" && (
          <form onSubmit={handleCreateDonation} className="flex flex-col">
            <p className="text-lg sm:text-xl font-medium mb-4">
              Enter Donation Amount
            </p>
            <input
              type="number"
              min="1"
              disabled={isBusy}
              required
              autoFocus
              value={money}
              className="bg-gray-200 rounded-2xl p-2 text-black mb-4 w-full"
              placeholder="₹ Amount"
              onChange={(e) => setMoney(e.target.value)}
            />

            {errorMsg && (
              <p className="text-red-600 text-xs sm:text-sm mb-3 break-words">
                {errorMsg}
              </p>
            )}

            <button
              className={`w-full py-2.5 rounded-full bg-linear-to-r from-green-300 to-green-700 text-white font-medium ${
                isBusy ? "cursor-not-allowed opacity-70" : "cursor-pointer"
              }`}
              disabled={isBusy}
            >
              {isBusy ? "Please wait..." : "Donate Now"}
            </button>
            <p className="mt-4 text-base sm:text-lg text-center text-green-800 font-medium">
              "And whatever you give in charity,
              <span className="font-bold ml-1 mr-1 text-red-600">Allah</span>
              knows it well"
            </p>
          </form>
        )}

        {step === "pay" && payment && (
          <div className="flex flex-col items-center">
            <p className="text-lg sm:text-xl font-medium mb-1">
              Pay ₹{payment.amount} via UPI
            </p>
            <p className="text-xs sm:text-sm text-gray-700 mb-4">
              to {payment.payeeName}
            </p>

            <div className="bg-white p-3 rounded-xl shadow-inner mb-4">
              <img
                src={qrDataUrl}
                alt="UPI QR code"
                className="w-44 h-44 sm:w-56 sm:h-56"
              />
            </div>

            <button
              type="button"
              onClick={openUpiApp}
              className="w-full py-2.5 rounded-full bg-linear-to-r from-green-300 to-green-700 text-white font-medium cursor-pointer mb-3"
            >
              {isMobileDevice
                ? "Pay with PhonePe / Paytm / GPay"
                : "Open in UPI App"}
            </button>

            <p className="text-xs sm:text-sm text-gray-700 mb-1">
              {isMobileDevice
                ? "Tap above to choose your UPI app, or scan the QR with another device."
                : "Scan this QR using PhonePe, Paytm, Google Pay, or any UPI app on your phone."}
            </p>

            <button
              type="button"
              onClick={copyUpiId}
              className="text-xs sm:text-sm text-green-800 underline cursor-pointer mb-5"
            >
              {copied ? "Copied!" : `Copy UPI ID (${payment.upiId})`}
            </button>

            <div className="w-full border-t border-gray-400 pt-4">
              <p className="text-xs sm:text-sm text-gray-800 mb-2">
                Already paid? Let us know so we can confirm it.
              </p>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="UPI transaction ID / UTR (optional)"
                className="bg-gray-200 rounded-2xl p-2 text-black mb-3 w-full text-xs sm:text-sm"
              />

              {errorMsg && (
                <p className="text-red-600 text-xs sm:text-sm mb-3 break-words">
                  {errorMsg}
                </p>
              )}

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={confirming}
                className={`w-full py-2.5 rounded-full bg-green-800 text-white font-medium mb-2 ${
                  confirming ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                }`}
              >
                {confirming ? "Please wait..." : "I've Completed the Payment"}
              </button>

              <button
                type="button"
                onClick={resetFlow}
                className="text-xs sm:text-sm text-gray-700 underline cursor-pointer"
              >
                Change amount
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-3">🕌</div>
            <p className="text-lg sm:text-xl font-semibold text-green-800 mb-2">
              JazakAllah Khair!
            </p>
            <p className="text-xs sm:text-sm text-gray-800 mb-6">
              Your donation has been recorded and is awaiting verification.
              Thank you for your generosity.
            </p>
            <button
              type="button"
              onClick={() => navigate("/main")}
              className="w-full py-2.5 rounded-full bg-linear-to-r from-green-300 to-green-700 text-white font-medium cursor-pointer mb-3"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={resetFlow}
              className="text-xs sm:text-sm text-gray-700 underline cursor-pointer"
            >
              Make another donation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donation;
