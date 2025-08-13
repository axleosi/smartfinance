"use client";

import { useState } from "react";
import axios from "axios";
import Navigation from "../components/NavBar";

export default function WinningsPage() {
  const [stockDecimal, setStockDecimal] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/winnings",
        { stockDecimal, receiptNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage(err.response?.data?.message || "Server error");
      } else {
        setMessage("Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navigation/>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border-2 border-pink-200">
        <h1 className="text-3xl font-extrabold text-purple-800 text-center mb-8">
          Check Your Winnings
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-purple-700">Stock Decimal</label>
            <input
              type="number"
              value={stockDecimal}
              onChange={(e) => setStockDecimal(e.target.value)}
              className="p-3 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition bg-purple-50 placeholder-purple-400"
              placeholder="Enter stock decimal"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium text-purple-700">Receipt Number</label>
            <input
              type="number"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="p-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition bg-pink-50 placeholder-pink-400"
              placeholder="Enter receipt number"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : "Check Winnings"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-6 p-4 rounded-2xl text-center font-medium shadow-lg ${
              message.includes("Congratulations")
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            } border-2`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
    </>
  );
}
