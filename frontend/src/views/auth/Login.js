import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEmailLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/manual-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful");

        switch (data.user.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "institute":
            navigate("/admin/upload");
            break;
          case "verifier":
            navigate("/admin/verify");
            break;
          default:
            navigate("/");
        }
      } else {
        alert(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Google login successful");

        switch (data.user.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "institute":
            navigate("/admin/upload");
            break;
          case "verifier":
            navigate("/admin/verify");
            break;
          default:
            navigate("/");
        }
      } else {
        alert("Google user not registered. Please register first.");
      }
    } catch (error) {
      console.error(error);
      alert("Google login failed");
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex content-center items-center justify-center h-full">
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col shadow-lg rounded-lg bg-blueGray-200 border-0">
            <div className="rounded-t px-6 py-6">
              <div className="text-center mb-3">
                <h6 className="text-blueGray-500 text-sm font-bold">
                  Sign in with Google
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
                <small>Or sign in with credentials</small>
              </div>
              <form>
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full"
                    placeholder="Email"
                  />
                </div>

                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full"
                    placeholder="Password"
                  />
                </div>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={handleEmailLogin}
                    className="bg-blueGray-800 text-white text-sm font-bold uppercase px-6 py-3 rounded shadow w-full"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>
            <div className="text-center mt-6 mb-4">
            <p className="text-blueGray-600 text-sm">
              Don't have an account?
              <Link
                to="/auth/register"
                className="text-lightBlue-500 hover:underline font-semibold ml-1"
              >
                Create one
              </Link>
            </p>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}
