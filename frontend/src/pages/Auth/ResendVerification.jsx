import React, { useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.RESEND_VERIFICATION, {
        email,
      });

      setMessage(response.data.message);
      setEmail("");
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Resend Verification</h3>
        <p className="text-xl text-slate-700 mt-[5px] mb-6">
          Enter your email address to resend the verification link
        </p>

        <form onSubmit={handleSubmit}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Enter your email"
            placeholder="johndoe@example.com"
            type="email"
            disabled={loading}
          />

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
          {message && <p className="text-green-500 text-xs pb-2.5">{message}</p>}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Sending..." : "Resend Verification"}
          </button>

          <p className="text-[13px] text-slate-800 mt-3 text-center">
            Already verified?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Go to Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResendVerification;
