'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import UserProfile from "../components/UserProfile";
import Navigation from "../components/NavBar";

interface User {
  name: string;
  email: string;
  role: "user" | "partner" | "admin";
  promoCode?: string;
  promoLink?: string;
  createdAt: string | Date;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>User not found</p>;

  return (
  <>
  <Navigation/>
  <UserProfile user={user} onUserUpdate={fetchUser} />
  </>
  )
}
