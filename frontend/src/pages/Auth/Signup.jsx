import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/UserContext";
import uploadImage from "../../utils/uploadImage";

// Add currency list (can be moved to a separate file)
const currencyList = [
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  // ...add more currencies as needed
];

const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  // const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState('NGN');

  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();

  // Handle Sign Up Form Submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    let profileImageUrl = "";
    if (!fullName) {
      setError("Please enter your Full name.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    setError("");

    // Sign Up API Call
    try {
      // Upload image if present
      if (profilePic) {
        const imgRes = await uploadImage(profilePic);
        profileImageUrl = imgRes.imageUrl || "";
      }

      // Build registration payload
      const payload = {
        fullName,
        email,
        password,
        profileImageUrl,
      };
      if (currency && currency !== "") {
        payload.defaultCurrency = currency;
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, payload);

      // Registration successful, redirect to verify email page
      navigate("/verify-email");
    } catch (error) {
      if (error.response) {
        // Show express-validator errors if present
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          setError(error.response.data.errors.map(e => e.msg).join("\n"));
        } else if (error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-auto md:h-full flex flex-col justify-center py-5">
        <h3 
          className="text-xl font-semibold transition-colors"
          style={{ color: 'var(--color-textPrimary)' }}
        >
          Create an Account
        </h3>
        <p 
          className="text-xs my-[15px] transition-colors"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          Join us today by Signing up with us
        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="flex flex-col gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="eg. John Doe"
              type="text"
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Enter your email"
              placeholder="johndoe@example.com"
              type="text"
            />

            <div className="col-span-2">
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Enter your Password"
                placeholder="Min 8 Characters"
                type="password"
              />
            </div>

            <div className="mb-4">
              <label 
                htmlFor="currency" 
                className="block text-sm font-medium mb-2 transition-colors"
                style={{ color: 'var(--color-textPrimary)' }}
              >
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="mt-1 block w-full border rounded-md shadow-sm p-2 transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-inputBackground)',
                  borderColor: 'var(--color-inputBorder)',
                  color: 'var(--color-textPrimary)'
                }}
              >
                {currencyList.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p 
              className="text-xs pb-2.5 transition-colors"
              style={{ color: 'var(--color-error)' }}
            >
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary">
            SIGN UP
          </button>

          <p 
            className="text-[13px] mt-3 transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            Have an account already?{" "}
            <Link 
              className="font-medium underline transition-colors" 
              style={{ color: 'var(--color-primary)' }}
              to="/login"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Signup;
