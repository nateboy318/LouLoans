import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    id: string;
    name: string;
    email: string;
    balance: string;
    creditScore: number;
    country: string;
  };
  onSave: (data: {
    customer_id: string;
    first_name: string;
    last_name: string;
    email: string;
    credit_score: number;
    country: string;
    balance: number;
  }) => Promise<void>;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, userData, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    balance: "",
    creditScore: 0,
    country: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        balance: userData.balance || "",
        creditScore: userData.creditScore || 0,
        country: userData.country.split(" ")[0] || "",
      });
    }
  }, [userData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "creditScore" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const [firstName, lastName] = formData.name.split(" ");
      const balanceNumber = parseFloat(
        formData.balance.replace(/[$,]/g, "") || "0",
      );

      const transformedData = {
        customer_id: userData.id,
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        credit_score: formData.creditScore,
        country: formData.country,
        balance: balanceNumber,
      };

      await onSave(transformedData);
      onClose();
    } catch (error) {
      console.error("Error in handleSave:", error);
      alert("Failed to update user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="border-1 relative mx-4 w-full max-w-lg rounded-sm bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              className="h-12 w-12"
              src={`https://api.dicebear.com/9.x/glass/svg?seed=${formData.name}`}
              alt="user-avatar"
            />
            <h2 className="text-xl font-semibold">{formData.name}</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save User"}
          </button>
        </div>

        <div className="my-4 border-b border-gray-200"></div>

        <div className="space-y-4">
          <div className="">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Balance
            </label>
            <input
              type="text"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Credit Score
            </label>
            <input
              type="number"
              name="creditScore"
              value={formData.creditScore}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
