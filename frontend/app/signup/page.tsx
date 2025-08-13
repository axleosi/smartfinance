'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Signup() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [wantsToBePartner, setWantsToBePartner] = useState(false);
  const [referralCodeOrLink, setReferralCodeOrLink] = useState(""); 
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promo = params.get("promo");

    if (promo) {
      setReferralCodeOrLink(promo);
      setIsReferralLocked(true);

      // ✅ Save referral in cookie for 7 days
      Cookies.set("referralCode", promo, { expires: 7 });

      // ✅ Track visit immediately
      axios.post(`${backendUrl}/api/referrals/track/${promo}`, {}, { withCredentials: true })
        .catch(err => console.error("Track visit error:", err));
    } else {
      // ✅ Load referral from cookie if exists
      const savedReferral = Cookies.get("referralCode");
      if (savedReferral) {
        setReferralCodeOrLink(savedReferral);
        setIsReferralLocked(true);
      }
    }
  }, []);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const referralToSend = referralCodeOrLink || Cookies.get("referralCode") || "";

      const res = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
        wantsToBePartner,
        referralCodeOrLink: referralToSend,
      });

      localStorage.setItem("token", res.data.token);
      router.push("/receipts");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Something went wrong");
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <form
        onSubmit={handleSignup}
        className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200"
      >
        <h2 className="text-3xl font-extrabold mb-2 text-gray-800">Create Account</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Join us and start managing your receipts effortlessly.
        </p>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email Address"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer text-sm select-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded pr-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer text-sm select-none"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </span>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Referral Code or Promo Link (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={referralCodeOrLink}
            onChange={(e) => setReferralCodeOrLink(e.target.value)}
            disabled={isReferralLocked}
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            id="partner"
            type="checkbox"
            checked={wantsToBePartner}
            onChange={() => setWantsToBePartner(!wantsToBePartner)}
            className="mr-2"
          />
          <label htmlFor="partner" className="text-gray-700 select-none">
            I want to be a partner
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform"
        >
          Sign Up
        </button>

        {error && (
          <p className="text-red-500 mb-3 bg-red-50 p-2 rounded text-sm">{error}</p>
        )}

        <p className="mt-5 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <span
            className="text-indigo-500 hover:underline cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Log in
          </span>
        </p>
      </form>
    </div>
  );
}
