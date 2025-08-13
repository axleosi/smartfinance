"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import Navigation from "../components/NavBar";

interface Receipt {
  _id: string;
  filename: string;
  originalImageUrl: string;
  createdAt: string;
  amount?: number;
}

export default function ReceiptsPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [file, setFile] = useState<File | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<{ receipts: Receipt[] }>(
        `${backendUrl}/api/receipts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReceipts(res.data.receipts);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.message || "Failed to load receipts");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load receipts");
      }
    }

  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("receipt", file);

      await axios.post(`${backendUrl}/api/receipts/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      fetchReceipts(); // Refresh list
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Upload failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
          Upload Receipts
        </h1>

        <form
          onSubmit={handleUpload}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-10"
        >
          <label
            htmlFor="fileInput"
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow transition"
          >
            {file ? file.name : "Choose File"}
          </label>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="submit"
            disabled={loading || !file}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded shadow disabled:opacity-50 transition"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {error && <p className="text-red-500 mb-6 text-center">{error}</p>}

        <h2 className="text-2xl font-semibold mb-4 text-center">Your Receipts</h2>

        {receipts.length === 0 ? (
          <p className="text-gray-600 text-center">No receipts uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {receipts.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                {r.originalImageUrl && (
                  <img
                    src={`http://localhost:5000${r.originalImageUrl}`}
                    alt={r.filename}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <p className="font-semibold truncate">{r.filename}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(r.createdAt).toLocaleString()}
                  </p>
                  {r.amount && <p className="mt-1 font-medium">${r.amount.toFixed(2)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
