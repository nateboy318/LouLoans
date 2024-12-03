"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/api";

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    balance: 0,
    credit_card: 0,
    estimated_salary: 0,
    credit_score: 0,
    country: "",
    gender: "",
    age: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    const isValid =
      formData.first_name.trim() !== "" &&
      formData.last_name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.balance !== null &&
      formData.credit_card !== null &&
      formData.estimated_salary !== null &&
      formData.credit_score !== null &&
      formData.country.trim() !== "" &&
      formData.gender !== "" &&
      formData.age !== "";
    console.log("Form validation result:", isValid);
    console.log("Current form data:", formData);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");

    setIsLoading(true);

    try {
      const userData = {
        ...formData,
        balance: Number(formData.balance),
        credit_card: Number(formData.credit_card),
        estimated_salary: Number(formData.estimated_salary),
        credit_score: Number(formData.credit_score),
        age: Number(formData.age),
      };

      console.log("Attempting to create user with data:", userData);

      try {
        const response = await createUser(userData);
        console.log("API Response:", response);
      } catch (apiError: any) {
        console.error("Detailed API Error:", {
          error: apiError,
          message: apiError.message,
          status: apiError.status,
          response: apiError.response,
        });
        throw apiError;
      }

      router.push("/users");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating user:", error);
      alert(`Failed to create user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create New User</h1>
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create User"}
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex gap-6">
          {/* Left Column */}
          <div className="w-1/2">
            <div className="h-full space-y-6 rounded-lg border bg-white p-6 shadow-sm">
              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  Required Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      First Name*
                    </label>
                    <input
                      required
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Last Name*
                    </label>
                    <input
                      required
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email*
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Phone*
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Address*
                    </label>
                    <input
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-1/2 space-y-6">
            {/* Financial Information Box */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">
                Financial Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Balance*
                  </label>
                  <input
                    required
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Credit Card*
                  </label>
                  <input
                    required
                    type="number"
                    name="credit_card"
                    value={formData.credit_card}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Estimated Salary*
                  </label>
                  <input
                    required
                    type="number"
                    name="estimated_salary"
                    value={formData.estimated_salary}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Credit Score*
                  </label>
                  <input
                    required
                    type="number"
                    name="credit_score"
                    value={formData.credit_score}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Demographics Box */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Demographics</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Country*
                  </label>
                  <input
                    required
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Gender*
                  </label>
                  <select
                    required
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Age*
                  </label>
                  <input
                    required
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
