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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // NEW

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle Sign Up Form Submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName) return setError("Please enter your Full name.");
    if (!validateEmail(email)) return setError("Please enter a valid email address.");
    if (!password) return setError("Please enter a password.");

    setLoading(true);
    try {
      // Warm-up ping to reduce cold start time
      try {
        await axiosInstance.get(API_PATHS.HEALTH, { timeout: 3000, params: { t: Date.now() } });
      } catch (_) {}

      // Upload image if present (supports string or { imageUrl })
      let profileImageUrl = "";
      if (profilePic) {
        const uploaded = await uploadImage(profilePic);
        profileImageUrl = typeof uploaded === "string" ? uploaded : uploaded?.imageUrl || "";
      }

      const payload = {
        fullName,
        email,
        password,
        profileImageUrl,
        ...(currency ? { defaultCurrency: currency } : {}),
      };

  const res = await axiosInstance.post(API_PATHS.AUTH.REGISTER, payload);

      // Navigate on success with email state for Verify page
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      // Show server validation or generic error
      const msg =
        err?.response?.data?.errors?.map?.((e) => e.msg).join("\n") ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      if (err?.code === "ECONNABORTED") {
        // Proceed to verify page on timeout to avoid blocking UX
        navigate("/verify-email", { state: { email } });
        return;
      }
      setError(msg);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-auto md:h-full flex flex-col justify-center py-5">
        <h3 className="text-xl font-semibold transition-colors" style={{ color: "var(--color-textPrimary)" }}>
          Create an Account
        </h3>
        <p className="text-xs my-[15px] transition-colors" style={{ color: "var(--color-textSecondary)" }}>
          Join us today by Signing up with us
        </p>

        <form onSubmit={handleSignUp}>
          {/* Align with ProfilePhotoSelector expected props */}
          <ProfilePhotoSelector
            currentImage={profilePic}
            onImageUpdate={setProfilePic}
            onImageDelete={() => setProfilePic(null)}
            fullName={fullName}
            isLoading={loading}
          />

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
                style={{ color: "var(--color-textPrimary)" }}
              >
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 block w-full border rounded-md shadow-sm p-2 transition-colors"
                style={{
                  backgroundColor: "var(--color-inputBackground)",
                  borderColor: "var(--color-inputBorder)",
                  color: "var(--color-textPrimary)",
                }}
              >
                {currencyList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs pb-2.5 transition-colors" style={{ color: "var(--color-error)" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "SIGN UP"}
          </button>

          <p className="text-[13px] mt-3 transition-colors" style={{ color: "var(--color-textPrimary)" }}>
            Have an account already?{" "}
            <Link className="font-medium underline transition-colors" style={{ color: "var(--color-primary)" }} to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Signup;
