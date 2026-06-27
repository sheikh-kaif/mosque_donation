import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const STATUS_LABELS = {
  created: {
    label: "Awaiting Payment",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  awaiting_verification: {
    label: "Pending Verification",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
  verified: {
    label: "Verified",
    color: "bg-green-100 text-green-700 border-green-300",
  },
};

const Badge = ({ status }) => {
  const cfg = STATUS_LABELS[status] || {
    label: status,
    color: "bg-gray-100 text-gray-600 border-gray-300",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
};

const Admin = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState("awaiting_verification");
  const [loadingData, setLoadingData] = useState(true);
  const [actionId, setActionId] = useState(null); // donation being actioned

  const fetchDonations = useCallback(async () => {
    setLoadingData(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const { data } = await axios.get(backendUrl + "/api/admin/donations", {
        params,
        withCredentials: true,
      });
      if (data.status) {
        setDonations(data.donations);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load donations");
    } finally {
      setLoadingData(false);
    }
  }, [backendUrl, filter]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleVerify = async (id) => {
    if (actionId) return;
    setActionId(id);
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/admin/donations/${id}/verify`,
        {},
        { withCredentials: true },
      );
      if (data.status) {
        toast.success("Payment verified ✅");
        // update locally
        setDonations((prev) =>
          prev.map((d) => (d._id === id ? { ...d, status: "verified" } : d)),
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (actionId) return;
    setActionId(id);
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/admin/donations/${id}/reject`,
        {},
        { withCredentials: true },
      );
      if (data.status) {
        toast.info("Donation reset to pending");
        setDonations((prev) =>
          prev.map((d) => (d._id === id ? { ...d, status: "created" } : d)),
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionId(null);
    }
  };

  const FILTERS = [
    { value: "awaiting_verification", label: "Needs Verification" },
    { value: "verified", label: "Verified" },
    { value: "created", label: "Awaiting Payment" },
    { value: "all", label: "All" },
  ];

  return (
    <div
      className="min-h-screen px-4 sm:px-6 py-6"
      style={{
        background: "linear-gradient(to bottom right, #F7FFF7, #CBFFB0)",
      }}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          {/* <button
            onClick={() => navigate("/main")}
            className="text-green-700 hover:text-green-900 transition text-sm flex items-center gap-1"
          >
            ← Dashboard
          </button> */}
          <div onClick={() => navigate("/main")} className="cursor-pointer">
            <img src="/favicon.png" alt="logo" className="w-6 sm:w-12" />
            <h1 className="text-sm sm:text-2xl ">
              <span className="text-gray-800 font-medium sm:font-bold">
                Faith
              </span>
              <span className="text-green-600 font-bold sm:font-extrabold">
                Fund
              </span>
            </h1>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Logged in as <span className="font-semibold">{userData?.name}</span>
        </p>
      </div>

      {/* Page title */}
      <h1 className="text-xl sm:text-2xl font-extrabold text-green-800 mb-1">
        Donation Management
      </h1>
      <p className="text-sm text-gray-600 mb-5">
        Verify donations after confirming payment in your bank / UPI statement.
        Donors see{" "}
        <span className="font-semibold text-orange-600">Pending</span> until you
        mark them as{" "}
        <span className="font-semibold text-green-600">Verified</span>.
      </p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
              filter === f.value
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={fetchDonations}
          disabled={loadingData}
          className="ml-auto px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-gray-300 bg-white text-gray-600 hover:border-green-500 transition-all disabled:opacity-50"
        >
          {loadingData ? "Loading…" : "↺ Refresh"}
        </button>
      </div>

      {/* Table (desktop) / cards (mobile) */}
      {loadingData ? (
        <div className="flex items-center justify-center py-24 text-gray-500">
          Loading donations…
        </div>
      ) : donations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="text-4xl mb-3">🕌</div>
          <p className="text-base font-medium">
            No donations found for this filter.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-green-50 text-green-800 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Donor</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">UTR</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => (
                  <tr
                    key={d._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {d.userId?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {d.userId?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-800">
                      ₹{d.amount}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {d.reference || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {d.utr || (
                        <span className="italic text-gray-300">none</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(d.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge status={d.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        donation={d}
                        onVerify={handleVerify}
                        onReject={handleReject}
                        busy={actionId === d._id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {donations.map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {d.userId?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {d.userId?.email || "—"}
                    </p>
                  </div>
                  <span className="text-green-800 font-bold text-base">
                    ₹{d.amount}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                  <span>
                    <span className="font-semibold text-gray-600">Ref:</span>{" "}
                    <span className="font-mono">{d.reference || "—"}</span>
                  </span>
                  {d.utr && (
                    <span>
                      <span className="font-semibold text-gray-600">UTR:</span>{" "}
                      <span className="font-mono">{d.utr}</span>
                    </span>
                  )}
                  <span>
                    {new Date(d.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge status={d.status} />
                  <ActionButtons
                    donation={d}
                    onVerify={handleVerify}
                    onReject={handleReject}
                    busy={actionId === d._id}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Summary counts */}
      {!loadingData && donations.length > 0 && (
        <p className="text-xs text-gray-500 mt-4 text-right">
          Showing {donations.length} donation{donations.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

// Extracted to keep the table rows clean
const ActionButtons = ({ donation, onVerify, onReject, busy }) => {
  if (donation.status === "verified") {
    return (
      <button
        onClick={() => onReject(donation._id)}
        disabled={busy}
        className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "…" : "Undo"}
      </button>
    );
  }

  if (donation.status === "awaiting_verification") {
    return (
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => onVerify(donation._id)}
          disabled={busy}
          className="text-xs px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "…" : "Verify ✓"}
        </button>
        <button
          onClick={() => onReject(donation._id)}
          disabled={busy}
          className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "…" : "Reject"}
        </button>
      </div>
    );
  }

  // status === "created" — donor hasn't clicked "I've paid" yet
  return <span className="text-xs text-gray-400 italic">No action</span>;
};

export default Admin;
