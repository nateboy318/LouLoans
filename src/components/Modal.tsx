import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onSave: (updatedUser: any) => void;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, userData, onSave }) => {
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    balance: userData.balance,
    creditScore: userData.creditScore,
    country: userData.country,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose(); // Close the modal after saving
  };

  return (
    isOpen && (
      <div className="modal">
        <div className="modal-content">
          <h2>Edit User</h2>
          <div>
            <label>Name:</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label>Balance:</label>
            <input
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label>Credit Score:</label>
            <input
              name="creditScore"
              type="number"
              value={formData.creditScore}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label>Country:</label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
