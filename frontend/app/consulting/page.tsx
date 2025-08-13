"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../components/NavBar";

interface Receipt {
  _id: string;
  originalImageUrl: string;
  total: number;
  items: { name: string; amount: number }[];
}

export default function ConsultingPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [adviceMap, setAdviceMap] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<{ receipts: Receipt[] }>(
          `${backendUrl}/api/receipts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const receiptsWithUrl = res.data.receipts.map(r => ({
          ...r,
          originalImageUrl: `${backendUrl}${r.originalImageUrl.startsWith('/') ? '' : '/'}${r.originalImageUrl}`,
        }));

        setReceipts(receiptsWithUrl);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load receipts");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const getAdvice = async (receiptId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<{ advice: string }>(
        `${backendUrl}/api/receipts/${receiptId}/advice`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdviceMap(prev => ({ ...prev, [receiptId]: res.data.advice }));
    } catch (err: unknown) {
      setAdviceMap(prev => ({
        ...prev,
        [receiptId]: err instanceof Error ? err.message : "Failed to get advice",
      }));
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading receipts...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (receipts.length === 0) return <p className="text-center mt-10 text-gray-500">No receipts uploaded yet.</p>;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 py-10">
        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-4xl font-bold mb-10 text-center text-gray-900">
            Your Receipts & Financial Advice
          </h1>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {receipts.map(r => (
              <div
                key={r._id}
                className="relative bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-64">
                  <img
                    src={r.originalImageUrl}
                    alt="Receipt"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-green-700 text-white font-semibold px-3 py-1 rounded-lg shadow-lg">
                    ${r.total.toFixed(2)}
                  </span>
                </div>

                <div className="p-5 flex flex-col items-center">
                  <button
                    onClick={() => getAdvice(r._id)}
                    className="py-2 px-6 bg-green-600 text-white font-semibold rounded-full shadow hover:bg-green-700 transition mb-3"
                  >
                    Get Advice
                  </button>

                  {adviceMap[r._id] && (
                    <div className="w-full bg-green-50 text-gray-900 p-4 rounded-2xl shadow-inner text-sm text-center">
                      {adviceMap[r._id]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
