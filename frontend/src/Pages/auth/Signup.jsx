import { useState } from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      api: "",
    }));

    setSuccess("");
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must contain at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setSuccess("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Temporary frontend-only signup
      console.log("Signup successful!");

      setErrors({});
      setSuccess("Signup successful! Backend integration is pending.");

    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Enter your details to get started."
      footerText="Already have an account?"
      footerLink="/login"
      footerLabel="Login"
    >
      <form
        onSubmit={handleSignup}
        className="mt-6 space-y-3.5"
        noValidate
      >
        {/* Full Name */}
        <AuthInput
          label="Full Name"
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />

        {/* Email */}
        <AuthInput
          label="Email address"
          name="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[15px] font-semibold text-[#DCE4F0]"
            >
              Password
            </label>

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              className="text-sm font-medium text-[#9CAFCB] transition hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <AuthInput
            label={null}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="confirmPassword"
              className="text-[15px] font-semibold text-[#DCE4F0]"
            >
              Confirm Password
            </label>

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((prev) => !prev)
              }
              className="text-sm font-medium text-[#9CAFCB] transition hover:text-white"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <AuthInput
            label={null}
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
        </div>

        {/* API Error */}
        {errors.api && (
          <p className="text-sm text-red-400">
            {errors.api}
          </p>
        )}

        {/* Success Message */}
        {success && (
          <p className="text-sm text-green-400">
            {success}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-3.5 text-sm font-bold hover:scale-101 transition transition-duration-400 hover:text-black transition duration-200 hover:bg-[#E5E7EB]"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}
