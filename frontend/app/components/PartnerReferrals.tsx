'use client'
import { useState, useEffect } from "react";
import axios from "axios";

interface Referral {
  _id: string;
  name: string;
  email: string;
  createdAt: string | Date;
}

export function PartnerReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReferrals() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/auth/referrals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReferrals(res.data.referrals);
        setCount(res.data.count);
      } catch (err) {
        console.error(err);
        setError("Failed to load referrals");
      } finally {
        setLoading(false);
      }
    }
    fetchReferrals();
  }, []);

  if (loading) return <p>Loading referrals...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (count === 0) return <p>No users have signed up using your referral code yet.</p>;

  return (
    <div className="mt-8 bg-indigo-50 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
        Your Referrals ({count})
      </h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-indigo-300">
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Email</th>
            <th className="py-2 px-3">Joined Date</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((user) => (
            <tr key={user._id} className="border-b border-indigo-200">
              <td className="py-2 px-3">{user.name}</td>
              <td className="py-2 px-3 break-all">{user.email}</td>
              <td className="py-2 px-3">{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
