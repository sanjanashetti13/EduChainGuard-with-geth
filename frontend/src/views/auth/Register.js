import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [googleToken, setGoogleToken] = useState(null);
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleManualRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/manual-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Manual registration successful");
        navigate("/");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const handleGoogleSuccess = async (response) => {
    const decoded = jwtDecode(response.credential);
    try {
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (res.ok && data.newUser) {
        // Ask for role if new Google user
        setGoogleToken(response.credential);
        setFormData((prev) => ({
          ...prev,
          name: decoded.name,
          email: decoded.email,
        }));
        setIsNewGoogleUser(true);
      } else if (res.ok && data.user) {
        alert("Google user already registered. Please log in.");
        navigate("/");
      } else {
        alert(data.error || "Google auth failed");
      }
    } catch (error) {
      console.error(error);
      alert("Google login failed");
    }
  };

  const handleGoogleRegisterWithRole = async () => {
    if (!formData.role) return alert("Please select a role");

    try {
      const res = await fetch("http://localhost:5000/api/auth/google-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken, role: formData.role }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Google registration complete");
        setIsNewGoogleUser(false);
        setGoogleToken(null);
        navigate("/"); // ✅ redirect after registration
      } else {
        alert(data.error || "Google registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error during Google registration");
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex content-center items-center justify-center h-full">
        <div className="w-full lg:w-6/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
            <div className="rounded-t mb-0 px-6 py-6">
              <div className="text-center mb-3">
                <h6 className="text-blueGray-500 text-sm font-bold">
                  Sign up with Google
                </h6>
              </div>
              <div className="btn-wrapper text-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert("Google login failed")}
                />
              </div>
              <hr className="mt-6 border-b-1 border-blueGray-300" />
            </div>

            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <div className="text-blueGray-400 text-center mb-3 font-bold">
                <small>Or sign up with credentials</small>
              </div>

              {/* Name */}
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full"
                />
              </div>

              {/* Email */}
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full"
                />
              </div>

              {/* Password (Only for manual) */}
              {!isNewGoogleUser && (
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full"
                  />
                </div>
              )}

              {/* Role Selection */}
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="border-0 px-3 py-3 bg-white text-blueGray-600 text-sm rounded shadow w-full"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="institute">Institute</option>
                  <option value="verifier">Verifier</option>
                </select>
              </div>

              {/* Button */}
              <div className="text-center mt-6">
                {isNewGoogleUser ? (
                  <button
                    onClick={handleGoogleRegisterWithRole}
                    className="bg-blueGray-800 text-white text-sm font-bold uppercase px-6 py-3 rounded shadow w-full"
                  >
                    Continue with Google
                  </button>
                ) : (
                  <button
                    onClick={handleManualRegister}
                    className="bg-blueGray-800 text-white text-sm font-bold uppercase px-6 py-3 rounded shadow w-full"
                  >
                    Create Account
                  </button>
                )}
              </div>

              <div className="text-center mt-4 mb-6">
                <p className="text-blueGray-600 text-sm">
                  Already have an account?
                  <Link
                    to="/"
                    className="text-lightBlue-500 hover:underline font-semibold ml-1"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
