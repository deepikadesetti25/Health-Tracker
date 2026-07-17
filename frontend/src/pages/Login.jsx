import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
function Login() {
const navigate = useNavigate();

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/token/",
      {
        username,
        password,
      }
    );

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    localStorage.setItem("username", username);

    alert("Login Successful!");

    navigate("/dashboard");
  } catch (error) {
    alert("Invalid Username or Password");
    console.log(error);
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center">

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-blue-900">
            Welcome Back 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Login to your AI-Powered Diet & Fitness Tracker
          </p>

        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-blue-900 font-semibold mb-2">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-blue-900 font-semibold mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>

        </form>

        <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <Link
                to="/signup"
                className="text-blue-700 font-bold hover:underline"
                >
                Sign Up
            </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;