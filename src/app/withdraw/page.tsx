"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface User {
  customer_id: string;
  first_name: string;
  last_name: string;
}

export default function WithdrawPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/select", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        const data = await response.json();
        let parsedData;
        if (data.body) {
          parsedData =
            typeof data.body === "string" ? JSON.parse(data.body) : data.body;
        } else {
          parsedData = data;
        }
        setUsers(parsedData || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  const handleWithdraw = async () => {
    if (!selectedUser) {
      setError("Please select a user");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: selectedUser,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalMessage(`Successfully withdrew $${amount}`);
        setShowModal(true);
        setAmount("");
        setSelectedUser("");
      } else {
        setError(data.message || "Withdrawal failed");
      }
    } catch (error) {
      setError("Failed to process withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-centers mb-6 text-2xl font-bold">Withdraw Funds</h1>

      <div className="rounded-lg border bg-white p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Select User
            </label>
            <select
              className="w-full rounded-md border p-2"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a user</option>
              {users &&
                users.map((user) => (
                  <option key={user.customer_id} value={user.customer_id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Amount</label>
            <input
              type="number"
              className="w-full rounded-md border p-2"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button
            className="w-full rounded-md bg-black px-4 py-2 text-white hover:opacity-80 disabled:opacity-50"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              "Withdraw"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-2 text-lg font-semibold">Withdrawal Complete</h3>
            <p className="mb-4">{modalMessage}</p>
            <button
              className="w-full rounded-md bg-black px-4 py-2 text-white hover:opacity-80"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
