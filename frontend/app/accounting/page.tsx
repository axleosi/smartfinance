"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import Navigation from "../components/NavBar";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

interface Receipt {
  _id: string;
  originalImageUrl: string;
  total: number;
  createdAt: string;
  category?: string;
}

interface CategoryTotal {
  _id: string;
  totalAmount: number;
}

interface AccountSummary {
  receiptsByMonth: Record<string, Receipt[]>;
  categoryTotalsByMonth: Record<string, CategoryTotal[]>;
}

export default function AccountingPage() {
  const [data, setData] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<AccountSummary>(
          "http://localhost:5000/api/accounts/summary",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!data) return <p className="text-center mt-10">No data available</p>;

  // Prepare pie chart: aggregate all category totals
  const allCategoryTotals: Record<string, number> = {};
  Object.values(data.categoryTotalsByMonth).forEach(monthTotals => {
    monthTotals.forEach(c => {
      allCategoryTotals[c._id] = (allCategoryTotals[c._id] || 0) + c.totalAmount;
    });
  });

  const pieData = {
    labels: Object.keys(allCategoryTotals),
    datasets: [
      {
        label: "Spending by Category",
        data: Object.values(allCategoryTotals),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6666",
          "#66FF99",
        ],
      },
    ],
  };

  // Prepare line chart: monthly spending trend
  const months = Object.keys(data.receiptsByMonth).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const monthlyTotals = months.map(month => {
    const receipts = data.receiptsByMonth[month];
    return receipts.reduce((sum, r) => sum + (r.total || 0), 0);
  });

  const lineData = {
    labels: months,
    datasets: [
      {
        label: "Total Spending",
        data: monthlyTotals,
        fill: false,
        borderColor: "#36A2EB",
        backgroundColor: "#36A2EB",
        tension: 0.2,
      },
    ],
  };

  return (
    <>
    <Navigation/>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Household Account Book</h1>

      {Object.keys(data.receiptsByMonth).map(month => {
        const receipts = data.receiptsByMonth[month];
        const monthlyTotal = receipts.reduce((sum, r) => sum + (r.total || 0), 0);

        return (
          <div key={month} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">{month}</h2>

            {/* Table for large screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border border-gray-300 divide-y divide-gray-200 rounded-lg shadow">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-gray-600 font-medium border-b border-gray-300">Date Uploaded</th>
                    <th className="p-3 text-left text-gray-600 font-medium border-b border-gray-300">Total</th>
                    <th className="p-3 text-left text-gray-600 font-medium border-b border-gray-300">Category</th>
                    <th className="p-3 text-left text-gray-600 font-medium border-b border-gray-300">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 border-b border-gray-200">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 border-b border-gray-200">₦{r.total.toLocaleString()}</td>
                      <td className="p-3 border-b border-gray-200">{r.category || "Uncategorized"}</td>
                      <td className="p-3 border-b border-gray-200">
                        <img
                          src={`http://localhost:5000${r.originalImageUrl}`}
                          alt="Receipt"
                          className="w-24 h-24 object-cover rounded shadow-sm"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-200 font-semibold">
                    <td className="p-3 border-t border-gray-300">Monthly Total</td>
                    <td className="p-3 border-t border-gray-300">₦{monthlyTotal.toLocaleString()}</td>
                    <td className="p-3 border-t border-gray-300" />
                    <td className="p-3 border-t border-gray-300" />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Card view for small screens */}
            <div className="md:hidden grid gap-4">
              {receipts.map(r => (
                <div key={r._id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{new Date(r.createdAt).toLocaleDateString()}</p>
                      <p className="font-semibold text-lg">₦{r.total.toLocaleString()}</p>
                      <p className="text-gray-600">{r.category || "Uncategorized"}</p>
                    </div>
                    <img
                      src={`http://localhost:5000${r.originalImageUrl}`}
                      alt="Receipt"
                      className="w-20 h-20 object-cover rounded shadow-sm"
                    />
                  </div>
                </div>
              ))}
              <div className="bg-gray-100 p-4 rounded-lg text-right font-semibold">
                Monthly Total: ₦{monthlyTotal.toLocaleString()}
              </div>
            </div>

          </div>
        );
      })}

      {/* Charts */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 text-center">Spending by Category (All Months)</h2>
        <div className="max-w-4xl mx-auto mb-10">
          <Pie data={pieData} />
        </div>

        <h2 className="text-xl font-semibold mb-4 text-center">Monthly Spending Trend</h2>
        <div className="max-w-4xl mx-auto">
          <Line data={lineData} />
        </div>
      </div>
    </div>
    </>
  );
}
