import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
function Signup(){
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); 
    
    const handleSignup = async (e) => {
        e.preventDefault();

            try {
                  const response = await axios.post("http://127.0.0.1:8000/api/signup/", {
                  username,
                  email,
                  password,
                 });

                  alert("Account Created Successfully!");

                  localStorage.setItem("access", response.data.access);
                  localStorage.setItem("refresh", response.data.refresh);
                  localStorage.setItem("username", response.data.username);

                  navigate("/dashboard");
                } catch (error) {
                        if (error.response && error.response.data.error) {
                        alert(error.response.data.error);
                        } else {
                        alert("Signup Failed");
                        }

                        console.log(error);
                    }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center">

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-blue-900">
            Create Account 🚀
          </h1>

          <p className="text-gray-500 mt-2">
            Create your account to start your health journey
          </p>

        </div>
       
        <form onSubmit={handleSignup} className="space-y-5">
            <div>
                <label className="block text-blue-900 font-semibold mb-2">
                    Full Name
                </label>

                <input
                type="text"
                placeholder="Enter your full name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
          <div>
            <label className="block text-blue-900 font-semibold mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Create Account
          </button>

        </form>

        <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link
                to="/"
                className="text-blue-700 font-bold hover:underline"
            >
                Login
            </Link>
        </p>

      </div>

    </div>
  );

}
export default Signup;