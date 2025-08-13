'use client'
import { useState } from "react";
import axios from "axios";
import { PartnerReferrals } from "./PartnerReferrals";

interface User {
  name: string;
  email: string;
  role: "user" | "partner" | "admin";
  promoCode?: string;
  promoLink?: string;
  createdAt: string | Date;
}

interface UserProfileProps {
  user: User;
  onUserUpdate?: () => void;
}

export default function UserProfile({ user, onUserUpdate }: UserProfileProps) {
  const [loading, setLoading] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied "${text}" to clipboard!`);
  };

  const becomePartner = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/auth/become-partner",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (onUserUpdate) onUserUpdate();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to become partner");
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg my-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Your Profile</h1>

      {/* Basic Info */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <div>
            <p className="font-semibold">Name</p>
            <p>{user.name}</p>
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="font-semibold">Role</p>
            <p className="capitalize">{user.role}</p>
          </div>
          <div>
            <p className="font-semibold">Joined</p>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Partner Info */}
      {user.role === "partner" ? (
        <>
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
              Your Partner Info
            </h2>

            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="flex-1">
                <p className="font-semibold text-indigo-800 mb-1">Promo Code</p>
                <p
                  className="text-xl font-mono bg-white p-2 rounded shadow cursor-pointer select-all"
                  onClick={() => user.promoCode && copyToClipboard(user.promoCode)}
                >
                  {user.promoCode}
                </p>
              </div>

              <button
                onClick={() => user.promoCode && copyToClipboard(user.promoCode)}
                className="mt-2 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Copy Code
              </button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="flex-1">
                <p className="font-semibold text-indigo-800 mb-1">Promo Link</p>
                <a
                  href={user.promoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-700 underline break-all"
                >
                  {user.promoLink}
                </a>
              </div>

              <button
                onClick={() => user.promoLink && copyToClipboard(user.promoLink)}
                className="mt-2 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Copy Link
              </button>
            </div>

            <div className="flex space-x-4">
              <a
                href={`https://twitter.com/intent/tweet?text=Join%20me%20using%20my%20promo%20code%20${user.promoCode}!%20${encodeURIComponent(user.promoLink ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Share Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(user.promoLink ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
              >
                Share Facebook
              </a>
            </div>
          </div>

          {/* Referrals */}
          <PartnerReferrals />
        </>
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <p className="mb-4 text-lg">
            Want to become a partner and start earning rewards?
          </p>
          <button
            onClick={becomePartner}
            disabled={loading}
            className="px-6 py-3 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Processing..." : "Become a Partner"}
          </button>
        </div>
      )}
    </div>
  );
}
