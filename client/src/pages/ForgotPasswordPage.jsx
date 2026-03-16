import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", text: "" });

    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
        email,
      });
      setStatus({ type: "success", text: response.data.message });
      setEmail("");
    } catch (error) {
      setStatus({
        type: "error",
        text: error.response?.data?.error || "Unable to send reset email",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Forgot Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we will send you a secure password reset link.
          </p>
        </div>

        {status.text ? (
          <div
            className={`mt-6 rounded-lg px-4 py-3 text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {status.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <Link to="/login" className="mt-5 block text-center text-sm font-medium text-blue-600">
          Back to login
        </Link>
      </div>
    </div>
  );
}
