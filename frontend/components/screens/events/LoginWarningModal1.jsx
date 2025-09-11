import React from "react";
import { Shield } from "lucide-react";

const LoginWarningModal = ({ onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white p-6 max-w-sm w-full shadow-2xl text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-black">
        Authentication Required
      </h2>
      <p className="text-gray-700 mb-6">
        You need to be logged in to create an event
      </p>
      <div className="flex justify-center gap-4">
        <a
          href="/authentication"
          className="bg-blue-600 hover:bg-blue-700 w-full text-white px-4 py-2 rounded"
        >
          Go to Login
        </a>
      </div>
    </div>
  </div>
);

export default LoginWarningModal;