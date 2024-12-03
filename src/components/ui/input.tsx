// Input.tsx
import React from "react";

type InputProps = {
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; // To handle different types like text, number, email, etc.
  placeholder?: string;
  className?: string; // For adding custom classes
};

const Input: React.FC<InputProps> = ({
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
}) => {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};

export default Input;
