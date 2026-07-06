import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
function Dashboard() {
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    disease_type: "",
  });
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [waterCount, setWaterCount] = useState(0);
  const waterGoal = 8;
  const [dietPlan, setDietPlan] = useState("");
  const [fitnessPlan, setFitnessPlan] = useState("");
  const [openSection, setOpenSection] = useState(null);
  const [bmiStatus, setBmiStatus] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Users fetch cheyyadam
  const fetchUsers = () => {
    axios
      .get("http://127.0.0.1:8000/api/users/")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Input changes handle cheyyadam
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // User create cheyyadam
  const handleSubmit = (e) => {
  e.preventDefault();

  // EDIT MODE
  if (editingId) {
    axios
      .put(
        `http://127.0.0.1:8000/api/users/${editingId}/`,
        formData
      )
      .then(() => {
        alert("User updated successfully! ✏️");

        setEditingId(null);

        setFormData({
          name: "",
          age: "",
          height: "",
          weight: "",
          disease_type: "diabetes",
        });

        fetchUsers();
      })
      .catch((error) => {
        console.error(error);
        alert("Error updating user!");
      });

    return;
  }

  // ADD MODE
  axios
    .post("http://127.0.0.1:8000/api/users/", formData)
    .then(() => {
      alert("User added successfully! 🎉");

      setFormData({
        name: "",
        age: "",
        height: "",
        weight: "",
        disease_type: "diabetes",
      });

      fetchUsers();
    })
    .catch((error) => {
      console.error(error);
      alert("Error adding user!");
    });
};
  const calculateBMI = () => {
  if (!bmiHeight || !bmiWeight) {
    alert("Please enter height and weight!");
    return;
  }

  const heightInMeters = bmiHeight / 100;
  const bmiValue = (
    bmiWeight /
    (heightInMeters * heightInMeters)
  ).toFixed(1);

  setBmi(bmiValue);

  if (bmiValue < 18.5) {
    setBmiStatus("Underweight ⚠️");
  } else if (bmiValue < 25) {
    setBmiStatus("Normal ✅");
  } else if (bmiValue < 30) {
    setBmiStatus("Overweight ⚠️");
  } else {
    setBmiStatus("Obese ❌");
  }
};
const getFitnessRecommendations = (disease) => {
  const exercises = {
    diabetes: [
      "🚶 Walking (30 mins)",
      "🧘 Yoga",
      "🚴 Light Cycling",
    ],

    hypertension: [
      "🧘 Meditation",
      "🚶 Brisk Walking",
      "🏊 Swimming",
    ],

    obesity: [
      "🏃 Running",
      "💪 Strength Training",
      "🚴 Cycling",
    ],
  };

  return exercises[disease] || [];
};
const editUser = (user) => {
  setFormData({
    name: user.name,
    age: user.age,
    height: user.height,
    weight: user.weight,
    disease_type: user.disease_type,
  });

  setEditingId(user.id);
};
const getDietRecommendations = (disease) => {
  const diets = {
    diabetes: [
      "🥦 Broccoli",
      "🍎 Apple",
      "🌾 Brown Rice",
      "🥜 Almonds",
    ],

    hypertension: [
      "🍌 Banana",
      "🥬 Spinach",
      "🥔 Sweet Potato",
      "🐟 Salmon",
    ],

    obesity: [
      "🥗 Salad",
      "🍗 Grilled Chicken",
      "🥒 Cucumber",
      "🍵 Green Tea",
    ],
  };

  return diets[disease] || [];
};
const addWater = () => {
  if (waterCount < waterGoal) {
    setWaterCount(waterCount + 1);
  }
};

const removeWater = () => {
  if (waterCount > 0) {
    setWaterCount(waterCount - 1);
  }
};
const getDietPlan = (disease) => {
  if (disease === "diabetes") {
    setDietPlan(`
🥗 Diabetes Diet Plan

• Eat whole grains
• Avoid sugary drinks
• Include green vegetables
• Eat nuts and seeds
`);
  }

  else if (disease === "hypertension") {
    setDietPlan(`
🥗 Hypertension Diet Plan

• Low sodium foods
• Fruits and vegetables
• Nuts and seeds
• Avoid processed food
`);
  }

  else if (disease === "obesity") {
    setDietPlan(`
🥗 Obesity Diet Plan

• High protein foods
• More vegetables
• Reduce sugar intake
• Daily hydration
`);
  }
};
const getFitnessTips = (disease) => {
  if (disease === "diabetes") {
    setFitnessPlan(`
🏃 Diabetes Fitness Plan

• Walking (30 mins)
• Yoga
• Light Cycling
`);
  }

  else if (disease === "hypertension") {
    setFitnessPlan(`
🏃 Hypertension Fitness Plan

• Meditation
• Walking
• Light Jogging
`);
  }

  else if (disease === "obesity") {
    setFitnessPlan(`
🏃 Obesity Fitness Plan

• Cardio
• Swimming
• Strength Training
`);
  }
};
const deleteUser = (id) => {
  if (!window.confirm("Are you sure you want to delete this user?")) {
    return;
  }

  axios
    .delete(`http://127.0.0.1:8000/api/users/${id}/`)
    .then(() => {
      alert("User deleted successfully! 🗑️");
      fetchUsers();
    })
    .catch((error) => {
      console.error(error);
      alert("Error deleting user!");
    });
};
const totalUsers = users.length;

  const diabetesCount = users.filter(
    (u) => u.disease_type === "diabetes"
    ).length;

    const hypertensionCount = users.filter(
      (u) => u.disease_type === "hypertension"
      ).length;

      const obesityCount = users.filter(
        (u) => u.disease_type === "obesity"
        ).length;

const averageBMI =
  users.length > 0
    ? (
        users.reduce((sum, user) => {
          const h = user.height / 100;
          return sum + user.weight / (h * h);
        }, 0) / users.length
      ).toFixed(1)
    : 0;
const chartData = [
  {
    name: "Diabetes",
    value: users.filter(
      (u) => u.disease_type === "diabetes"
    ).length,
  },
  {
    name: "Hypertension",
    value: users.filter(
      (u) => u.disease_type === "hypertension"
    ).length,
  },
  {
    name: "Obesity",
    value: users.filter(
      (u) => u.disease_type === "obesity"
    ).length,
  },
];

const COLORS = ["#60A5FA", "#34D399", "#FBBF24"];

return (
        <div className="min-h-screen bg-sky-50 p-8">     
        <h1 className="text-5xl font-bold text-sky-900 mb-8 text-center">
          AI-Powered Diet and Fitness Tracker
          <br/>
          for Chronic Disease Management 🩺
        </h1>
<br/>
        <div className="bg-white p-6 rounded-3xl shadow-lg mb-8 border border-sky-200">
          <h2 className="text-3xl font-bold text-sky-900 mb-4">
          📊 Health Dashboard
          </h2>
<div className="bg-white p-6 rounded-3xl shadow-lg mb-8 border border-sky-200">
  <h2 className="text-3xl font-bold text-sky-900 mb-6">
    📈 Disease Distribution
  </h2>

  <div className="w-full h-80">
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={130}
          label
        >
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
          <div className="grid grid-cols-2 gap-4 text-lg">
          <p>👥 Total Users: {totalUsers}</p>
          <p>🩺 Average BMI: {averageBMI}</p>
          <p>🍎 Diabetes: {diabetesCount}</p>
          <p>❤️ Hypertension: {hypertensionCount}</p>
          <p>⚖️ Obesity: {obesityCount}</p>
          </div>
        </div>
        <div className="bg-cyan-50 p-6 rounded-3xl shadow-lg mb-8 border border-cyan-200">
          <h2 className="text-3xl font-bold text-cyan-800 mb-4">
            💧 Daily Water Tracker
          </h2>

          <p className="text-lg mb-4">
          Goal: {waterGoal} glasses/day
          </p>

        <div className="flex items-center gap-4 mb-4">
          <button
              onClick={removeWater}
              className="bg-red-400 text-white px-4 py-2 rounded-xl hover:bg-red-500"
            >
              ➖
          </button>

            <span className="text-2xl font-bold">
              {waterCount} Glasses
            </span>

            <button
              onClick={addWater}
              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600"
              >
             ➕
            </button>
        </div>

  <div className="w-full bg-gray-200 rounded-full h-4">
    <div
      className="bg-cyan-500 h-4 rounded-full transition-all"
      style={{
        width: `${(waterCount / waterGoal) * 100}%`,
      }}
    ></div>
  </div>

  <p className="mt-3 text-gray-700">
    {((waterCount / waterGoal) * 100).toFixed(1)}% completed
  </p>
</div>
      {/* FORM */}
      
      <div className="bg-blue-100 p-6 rounded-3xl shadow-lg mb-8">
        <h2 className="text-3xl text-blue-900 font-semibold mb-4">
          Add New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-blue-200 bg-white text-gray-800 
            focus:outline-none focus:ring-2 focus:ring-sky-400"
            required
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-blue-200 bg-white text-gray-800 
            focus:outline-none focus:ring-2 focus:ring-sky-400"
            required
          />

          <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            value={formData.height}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-blue-200 bg-white text-gray-800 
            focus:outline-none focus:ring-2 focus:ring-sky-400"
            required
          />

          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-blue-200 bg-white text-gray-800 
            focus:outline-none focus:ring-2 focus:ring-sky-400"
            required
          />

          <select
            name="disease_type"
            value={formData.disease_type}
            onChange={handleChange}
            className="w-full p-4 bg-white text-gray-700 border border-blue-200 
            rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled> Choose Disease</option>
            <option value="diabetes"className="text-black bg-white">Diabetes</option>
            <option value="hypertension"className="text-black bg-white">Hypertension</option>
            <option value="obesity"className="text-black bg-white">Obesity</option>
          </select>

        <button
          type="submit"
          className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition"
          >
          {editingId ? "Update User ✏️" : "Add User ➕"}
        </button>
        </form>
      </div>
        <div className="bg-cyan-50 p-6 rounded-3xl shadow-lg mb-8 border border-cyan-200">

  <h2 className="text-3xl font-bold text-sky-900 mb-4">
    BMI Calculator 🩺
  </h2>

  <div className="space-y-4">

    <input
      type="number"
      placeholder="Height (cm)"
      value={bmiHeight}
      onChange={(e) => setBmiHeight(e.target.value)}
      className="w-full p-3 rounded-xl border border-blue-200"
    />

    <input
      type="number"
      placeholder="Weight (kg)"
      value={bmiWeight}
      onChange={(e) => setBmiWeight(e.target.value)}
      className="w-full p-3 rounded-xl border border-blue-200"
    />

    <button
      onClick={calculateBMI}
      className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600"
    >
      Calculate BMI
    </button>

    {bmi && (
      <div className="mt-4 text-lg">
        <p>
          <strong>Your BMI:</strong> {bmi}
        </p>

        <p>
          <strong>Status:</strong> {bmiStatus}
        </p>
      </div>
    )}

  </div>

</div>

      {/* USER LIST */}
      <h2 className="text-3xl text-blue-900 font-semibold mb-4">
        User Profiles
      </h2>

      {users.map((user) => (
        <div
          key={user.id}
          className="bg-blue-50 border border-blue-200 p-5 rounded-3xl shadow-md mb-4"
          >
          <h3 className="text-2xl font-bold text-sky-800">
            {user.name}
          </h3>
          <p className="text-gray-700">Age: {user.age}</p>
          <p className="text-gray-700">Height: {user.height} cm</p>
          <p className="text-gray-700">Weight: {user.weight} kg</p>
          <p className="text-gray-700">Disease: {user.disease_type}</p>
          <div className="flex gap-3 mt-4">
        <button
          onClick={() => {
          getDietPlan(user.disease_type);

          setOpenSection(
            openSection === "diet" ? null : "diet"
          );
          }}
          className={`px-5 py-2 rounded-xl text-white ${
            openSection === "diet"
            ? "bg-green-700": "bg-green-500"
          }`}
          >
          🥗 Diet Plan
        </button>

        <button
          onClick={() => {
          getFitnessTips(user.disease_type);

          setOpenSection(
          openSection === "fitness" ? null : "fitness"
          );
          }}
          className={`px-5 py-2 rounded-xl text-white ${
          openSection === "fitness"
          ? "bg-blue-700": "bg-blue-500"
          }`}
          >
          🏃 Fitness Tips
      </button>
        </div>
        {openSection === "diet" && dietPlan && (
        <div className="mt-6 bg-green-50 p-6 rounded-3xl shadow-lg">
          <pre className="whitespace-pre-wrap font-sans">
          {dietPlan}
          </pre>
        </div>
        )} 

        {openSection === "fitness" && fitnessPlan && (
        <div className="mt-6 bg-blue-50 p-6 rounded-3xl shadow-lg">
          <pre className="whitespace-pre-wrap font-sans">
            {fitnessPlan}
          </pre>
        </div>
        )}
        
          <div className="mt-4">
          <h4 className="font-bold text-green-700">
            Recommended Diet 🥗
          </h4>

          <ul className="list-disc ml-6 mt-2 text-gray-700">
            {getDietRecommendations(user.disease_type).map(
            (food, index) => (
            <li key={index}>{food}</li>
            )
            )}
          </ul>
        </div>
          <div className="mt-4">
            <h4 className="font-bold text-blue-700">
              Recommended Exercises 🏃
            </h4>

            <ul className="list-disc ml-6 mt-2 text-gray-700">
              {getFitnessRecommendations(user.disease_type).map(
              (exercise, index) => (
              <li key={index}>{exercise}</li>
              )
              )}
            </ul>
          </div>
          <button
            onClick={() => editUser(user)}
            className="mt-4 mr-3 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600"
          >
            Edit User ✏️
          </button>
          <button
            onClick={() => deleteUser(user.id)}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
          >
            Delete User 🗑️
          </button>
        </div>
      ))}
      {dietPlan && (
      <div className="bg-green-50 border border-green-200 p-6 rounded-3xl shadow-md mt-6 whitespace-pre-line">
        <h2 className="text-2xl font-bold text-green-800 mb-3">
          🥗 AI Diet Recommendation
        </h2>

        <p className="text-gray-700">{dietPlan}</p>
      </div>
      )}

      {fitnessPlan && (
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl shadow-md mt-6 whitespace-pre-line">
        <h2 className="text-2xl font-bold text-blue-800 mb-3">
          🏃 AI Fitness Recommendation
        </h2>

        <p className="text-gray-700">{fitnessPlan}</p>
      </div>
      )}
    </div>
  );
}


export default Dashboard;