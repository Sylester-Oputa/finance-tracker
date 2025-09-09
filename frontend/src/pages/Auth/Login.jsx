import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();

  // Handle Login Form Submission
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return;
    }

    if (!password) {
      setError("Please enter the password.")
      return;
    }

    setError("")

    // Login API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });
      const { accessToken, user } = response.data;

      if (accessToken) {
        localStorage.setItem("token", accessToken);
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };
  
  return (
    <AuthLayout>
      <div className="lg:w-[70%] md:h-full flex flex-col justify-center">
        <h3 
          className="text-xl font-semibold transition-colors"
          style={{ color: 'var(--color-textPrimary)' }}
        >
          Welcome Back
        </h3>
        <p 
          className="text-xl mt-[5px] mb-6 transition-colors"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          Please enter your Login details
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Enter your email"
            placeholder="johndoe@example.com"
            type="text"
          />

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Enter your Password"
            placeholder="Min 8 Characters"
            type="password"
          />

          {error && (
            <p 
              className="text-xs pb-2.5 transition-colors"
              style={{ color: 'var(--color-error)' }}
            >
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary">
            LOGIN
          </button>

          <div className="text-center mt-3">
            <Link 
              className="text-[13px] underline transition-colors" 
              style={{ color: 'var(--color-primary)' }}
              to="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>

          <p 
            className="text-[13px] mt-3 text-center transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            Don't have an account?{" "}
            <Link 
              className="font-medium underline transition-colors" 
              style={{ color: 'var(--color-primary)' }}
              to="/signup"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
