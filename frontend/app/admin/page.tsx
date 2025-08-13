'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Interfaces for API data types

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'partner' | 'admin';
  receiptCount: number;
  winningCount: number;
}

interface Partner {
  _id: string;
  name: string;
  email: string;
  promoCode: string;
  referredUserCount: number;
}

interface Payment {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

interface Coupon {
  _id: string;
  code: string;
  partnerId?: { name: string } | null;
  userId?: { name: string } | null;
  issuedAt?: string | null;
  redeemed: boolean;
}

interface WinningEntry {
  _id: string;
  name: string;
  stockDecimal: number;
  receiptNumber: number;
  date: string;
}

interface VisitorSource {
  partnerName: string;
  visits: number;
}

interface SNSShare {
  _id: string;
  platform: string;
  userId?: { name?: string } | null;
}

interface PopularQuery {
  _id: string;
  count: number;
}

interface MonthlyWinning {
  _id: number; // month number
  count: number;
}

interface PartnerRanking {
  _id: string;
  name: string;
  referralCount: number;
}

interface DashboardStats {
  totalUsers: number;
  subscriptionRevenue: number;
  popularQueries: PopularQuery[];
  monthlyWinnings: MonthlyWinning[];
  partnerRanking: PartnerRanking[];
}

const AdminDashboard: React.FC = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [users, setUsers] = useState<User[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [winnings, setWinnings] = useState<WinningEntry[]>([]);
  const [visitorSources, setVisitorSources] = useState<VisitorSource[]>([]);
  const [snsShares, setSnsShares] = useState<SNSShare[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [
        usersRes,
        partnersRes,
        paymentsRes,
        couponsRes,
        winningsRes,
        visitorSourcesRes,
        snsSharesRes,
        dashboardStatsRes,
      ] = await Promise.all([
        axios.get<User[]>(`${backendUrl}/api/admin/users`, config),
        axios.get<Partner[]>(`${backendUrl}/api/admin/partners`, config),
        axios.get<Payment[]>(`${backendUrl}/api/admin/payments`, config),
        axios.get<Coupon[]>(`${backendUrl}/api/admin/coupons`, config),
        axios.get<WinningEntry[]>(`${backendUrl}/api/admin/winnings`, config),
        axios.get<VisitorSource[]>(`${backendUrl}/api/admin/visitor-sources`, config),
        axios.get<SNSShare[]>(`${backendUrl}/api/admin/sns-shares`, config),
        axios.get<DashboardStats>(`${backendUrl}/api/admin/dashboard-stats`, config),
      ]);

      setUsers(usersRes.data);
      setPartners(partnersRes.data);
      setPayments(paymentsRes.data);
      setCoupons(couponsRes.data);
      setWinnings(winningsRes.data);
      setVisitorSources(visitorSourcesRes.data);
      setSnsShares(snsSharesRes.data);
      setDashboardStats(dashboardStatsRes.data);
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('Failed to fetch data');
  }
}
    setLoading(false);
  };

  fetchAllData();
}, []);


  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
  <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center md:text-left">
    Admin Dashboard
  </h1>

  {/* Dashboard Overview */}
  {dashboardStats && (
    <section className="mb-10 bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">
        Overview
      </h2>
      <ul className="space-y-6 text-gray-700">
        <li>
          <span className="font-semibold text-indigo-600">Total Users:</span> {dashboardStats.totalUsers}
        </li>
        <li>
          <span className="font-semibold text-indigo-600">Subscription Revenue:</span> ${dashboardStats.subscriptionRevenue.toLocaleString()}
        </li>
        <li>
          <span className="font-semibold text-indigo-600">Popular Queries:</span>
          <ul className="list-disc list-inside mt-2 space-y-1 max-h-48 overflow-y-auto">
            {dashboardStats.popularQueries.map((q) => (
              <li key={q._id} className="truncate">{q._id} ({q.count} times)</li>
            ))}
          </ul>
        </li>
        <li>
          <span className="font-semibold text-indigo-600">Monthly Winnings:</span>
          <ul className="list-disc list-inside mt-2 space-y-1 max-h-48 overflow-y-auto">
            {dashboardStats.monthlyWinnings.map(({ _id, count }) => (
              <li key={_id}>Month {_id}: {count}</li>
            ))}
          </ul>
        </li>
        <li>
          <span className="font-semibold text-indigo-600">Top Partners:</span>
          <ul className="list-disc list-inside mt-2 space-y-1 max-h-48 overflow-y-auto">
            {dashboardStats.partnerRanking.map((p) => (
              <li key={p._id} className="truncate">{p.name} — Referrals: {p.referralCount}</li>
            ))}
          </ul>
        </li>
      </ul>
    </section>
  )}

  {/* Users Section */}
  <section className="mb-10">
    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">
      Users ({users.length})
    </h2>
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-indigo-50">
          <tr>
            {["Name", "Email", "Role", "Receipt Count", "Winning Count"].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-indigo-50 transition-colors">
              <td className="px-6 py-3 whitespace-nowrap text-gray-900">{u.name}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{u.email}</td>
              <td className="px-6 py-3 whitespace-nowrap text-indigo-600 font-semibold">{u.role}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{u.receiptCount}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{u.winningCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>

  {/* Partners Section */}
  <section className="mb-10">
    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">
      Partners ({partners.length})
    </h2>
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-indigo-50">
          <tr>
            {["Name", "Email", "Promo Code", "Referred Users"].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {partners.map((p) => (
            <tr key={p._id} className="hover:bg-indigo-50 transition-colors">
              <td className="px-6 py-3 whitespace-nowrap text-gray-900">{p.name}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{p.email}</td>
              <td className="px-6 py-3 whitespace-nowrap text-indigo-600 font-semibold">{p.promoCode}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{p.referredUserCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>

  {/* Payments Section */}
  <section className="mb-10">
    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">
      Payments (Latest 50)
    </h2>
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-indigo-50">
          <tr>
            {["User ID", "Amount", "Currency", "Status", "Payment Method", "Date"].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.map((p) => (
            <tr key={p._id} className="hover:bg-indigo-50 transition-colors">
              <td className="px-6 py-3 whitespace-nowrap text-gray-900">{p.userId}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">${p.amount.toFixed(2)}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{p.currency}</td>
              <td className="px-6 py-3 whitespace-nowrap">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                  p.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : p.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{p.paymentMethod}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-600">{new Date(p.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>

  {/* Coupons Section */}
  <section className="mb-10">
    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">
      Coupons (Latest 50)
    </h2>
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-indigo-50">
          <tr>
            {["Code", "Partner", "User", "Issued At", "Redeemed"].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {coupons.map((c) => (
            <tr key={c._id} className="hover:bg-indigo-50 transition-colors">
              <td className="px-6 py-3 whitespace-nowrap text-gray-900">{c.code}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{c.partnerId?.name ?? '-'}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{c.userId?.name ?? '-'}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-600">{c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : '-'}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{c.redeemed ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>

  {/* Winning Entries Section */}
  <section className="mb-10">
    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">
      Winning Entries
    </h2>
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-indigo-50">
          <tr>
            {["Name", "Stock Decimal", "Receipt Number", "Date"].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {winnings.map((w) => (
            <tr key={w._id} className="hover:bg-indigo-50 transition-colors">
              <td className="px-6 py-3 whitespace-nowrap text-gray-900">{w.name}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{w.stockDecimal}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{w.receiptNumber}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-600">{new Date(w.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>

  {/* Visitor Sources Section */}
  <section className="mb-10">
    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">
      Visitor Sources
    </h2>
    <ul className="list-disc list-inside space-y-1 text-gray-700 max-w-md">
      {visitorSources.map((v) => (
        <li key={v.partnerName} className="truncate">
          <span className="font-semibold text-indigo-600">{v.partnerName}</span>: {v.visits.toLocaleString()} visits
        </li>
      ))}
    </ul>
  </section>

  {/* SNS Shares Section */}
  <section className="mb-10">
    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">
      SNS Shares
    </h2>
    <ul className="list-disc list-inside space-y-1 text-gray-700 max-w-md">
      {snsShares.map((s) => (
        <li key={s._id} className="truncate">
          <span className="font-semibold text-indigo-600">{s.platform}</span> share by {s.userId?.name ?? 'Unknown'}
        </li>
      ))}
    </ul>
  </section>
</div>

  );
};

export default AdminDashboard;
