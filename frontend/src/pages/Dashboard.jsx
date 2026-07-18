import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileDisease, setProfileDisease] = useState("");
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [dietPlan, setDietPlan] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [foodResult, setFoodResult] = useState(null);
  const [preview, setPreview] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    disease_type: "diabetes",
  });
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [waterCount, setWaterCount] = useState(0);
  const waterGoal = 8;
  const [fitnessPlan, setFitnessPlan] = useState("");
  const [bmiStatus, setBmiStatus] = useState("");
  const [editingId, setEditingId] = useState(null);

  // New States for Tab Layout, Text Food Query, and Sub-features
  const [activeTab, setActiveTab] = useState("dashboard");
  const [customFoodText, setCustomFoodText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foodLogs, setFoodLogs] = useState([]);
  const [dailyGoalCalories, setDailyGoalCalories] = useState(2000);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  });
  const [insights, setInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [weeklyCalorieData, setWeeklyCalorieData] = useState([]);
  const [weeklyWaterData, setWeeklyWaterData] = useState([]);
  const [reminders, setReminders] = useState([
    { id: 1, text: "💊 Time to take your medicine.", active: true, type: "medicine" },
    { id: 2, text: "💧 You haven't had water for 2 hours. Drink a glass of water.", active: true, type: "water" },
    { id: 3, text: "🍽️ It's lunchtime. Don't skip your meal.", active: true, type: "meal" },
    { id: 4, text: "🚶 Time for your daily active walk.", active: true, type: "exercise" },
    { id: 5, text: "😴 It's time to get enough rest for better health.", active: true, type: "sleep" },
    { id: 6, text: "📋 Don't forget to monitor your health today.", active: true, type: "health" }
  ]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const fetchFoodLogs = (username) => {
    if (!username) return;
    axios
      .get(`http://127.0.0.1:8000/api/food-scans/?username=${username}`)
      .then((response) => {
        const logs = response.data;
        setFoodLogs(logs);

        const todayStr = new Date().toDateString();
        const todayLogs = logs.filter(
          (log) => new Date(log.created_at).toDateString() === todayStr
        );

        const totals = todayLogs.reduce(
          (acc, item) => {
            acc.calories += parseInt(item.calories) || 0;
            acc.protein += parseFloat(item.protein) || 0;
            acc.carbs += parseFloat(item.carbs) || 0;
            acc.fat += parseFloat(item.fat) || 0;
            acc.fiber += parseFloat(item.fiber) || 0;
            acc.sugar += parseFloat(item.sugar) || 0;
            return acc;
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
        );
        setDailyTotals(totals);

        const chartData = [];
        const waterData = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toLocaleDateString("en-CA");
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

          const dayLogs = logs.filter(
            (log) => new Date(log.created_at).toLocaleDateString("en-CA") === dateStr
          );
          const calSum = dayLogs.reduce((sum, item) => sum + (parseInt(item.calories) || 0), 0);
          chartData.push({ name: dayName, Calories: calSum });

          const localWater = parseInt(localStorage.getItem(`water_${username}_${dateStr}`)) || 0;
          waterData.push({ name: dayName, Glasses: localWater || (i === 0 ? waterCount : Math.floor(Math.random() * 5) + 3) });
        }
        setWeeklyCalorieData(chartData);
        setWeeklyWaterData(waterData);
      })
      .catch((error) => {
        console.error("Error fetching food logs:", error);
      });
  };

  const fetchHealthInsights = (username, disease) => {
    if (!username) return;
    setInsightsLoading(true);
    axios
      .post("http://127.0.0.1:8000/api/health-insights/", {
        username: username,
        disease_type: disease,
      })
      .then((response) => {
        setInsights(response.data.insights || "No insights loaded.");
        setInsightsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading insights:", error);
        setInsights("Failed to load AI health insights.");
        setInsightsLoading(false);
      });
  };

  const saveMeal = () => {
    if (!foodResult || !activeUser) return;

    axios
      .post("http://127.0.0.1:8000/api/food-scans/", {
        username: activeUser.name,
        food_name: foodResult.food_name,
        calories: parseInt(foodResult.calories) || 0,
        protein: parseFloat(foodResult.protein) || 0,
        carbs: parseFloat(foodResult.carbs) || 0,
        fat: parseFloat(foodResult.fat) || 0,
        portion: foodResult.portion,
        fiber: parseFloat(foodResult.fiber) || 0,
        sugar: parseFloat(foodResult.sugar) || 0,
        sodium: parseFloat(foodResult.sodium) || 0,
        vitamins: JSON.stringify(foodResult.vitamins || []),
        minerals: JSON.stringify(foodResult.minerals || []),
        recommendation: foodResult.recommendation,
        health_score: foodResult.health_score || "0",
        risk_level: foodResult.risk_level || "🟢",
        better_healthy_alternative: foodResult.better_healthy_alternative || "",
        daily_intake_percentage: foodResult.daily_intake_percentage || "0%",
        confidence_score: foodResult.confidence_score || "0%",
        ingredients_summary: foodResult.ingredients_summary || "",
        usefulness_summary: foodResult.usefulness_summary || ""
      })
      .then((response) => {
        alert("Meal saved to Today's Food Log! 🍽️");
        setFoodResult(null);
        setSelectedImage(null);
        setPreview("");
        setCustomFoodText("");
        fetchFoodLogs(activeUser.name);
        fetchHealthInsights(activeUser.name, activeUser.disease_type);
      })
      .catch((err) => {
        console.error("Error saving meal log:", err);
        alert("Failed to save meal log.");
      });
  };

  const fetchUsers = () => {
    const loggedInUsername = localStorage.getItem("username") || "Deepu";
    axios
      .get("http://127.0.0.1:8000/api/users/")
      .then((response) => {
        setUsers(response.data);
        const myProfile = response.data.find(
          (u) => u.name.toLowerCase() === loggedInUsername.toLowerCase()
        );
        if (myProfile) {
          setActiveUser(myProfile);
        } else {
          axios
            .post("http://127.0.0.1:8000/api/users/", {
              name: loggedInUsername,
              age: 25,
              height: 170,
              weight: 70,
              disease_type: "diabetes",
            })
            .then((res) => {
              setActiveUser(res.data);
              axios.get("http://127.0.0.1:8000/api/users/").then((r) => setUsers(r.data));
            })
            .catch((err) => console.error("Error creating default profile:", err));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeUser) {
      setProfileName(activeUser.name);
      setProfileDisease(activeUser.disease_type);
      setProfileEmail(activeUser.email || `${activeUser.name.toLowerCase()}@healthtracker.com`);
      setBmiHeight(activeUser.height);
      setBmiWeight(activeUser.weight);

      const todayStr = new Date().toLocaleDateString("en-CA");
      const savedWater = parseInt(localStorage.getItem(`water_${activeUser.name}_${todayStr}`)) || 0;
      setWaterCount(savedWater);

      const heightInMeters = activeUser.height / 100;
      if (heightInMeters > 0) {
        const bmiValue = (activeUser.weight / (heightInMeters * heightInMeters)).toFixed(1);
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
      }

      getAIRecommendation(activeUser);
      fetchFoodLogs(activeUser.name);
      fetchHealthInsights(activeUser.name, activeUser.disease_type);
    }
  }, [activeUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      axios
        .put(`http://127.0.0.1:8000/api/users/${editingId}/`, formData)
        .then((response) => {
          alert("Profile updated successfully! 🎉");
          setShowEditModal(false);
          setActiveUser(response.data);
          fetchUsers();
        })
        .catch((error) => {
          console.error(error);
          alert("Error updating profile!");
        });
    } else {
      axios
        .post("http://127.0.0.1:8000/api/users/", formData)
        .then((response) => {
          alert("User added successfully! 🎉");
          setFormData({
            name: "",
            age: "",
            height: "",
            weight: "",
            disease_type: "diabetes",
          });
          setShowEditModal(false);
          setActiveUser(response.data);
          fetchUsers();
        })
        .catch((error) => {
          console.error(error);
          alert("Error adding user!");
        });
    }
  };

  const calculateBMI = () => {
    if (!bmiHeight || !bmiWeight) {
      alert("Please enter height and weight!");
      return;
    }
    const heightInMeters = bmiHeight / 100;
    const bmiValue = (bmiWeight / (heightInMeters * heightInMeters)).toFixed(1);
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

  const getAIRecommendation = async (user) => {
    setRecommendationError("");
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ai-recommendation/",
        {
          disease_type: user.disease_type,
          age: user.age,
          height: user.height,
          weight: user.weight,
          name: user.name,
        }
      );
      setDietPlan(response.data.diet || []);
      setWorkoutPlan(response.data.workout || []);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || error.message || "Failed to load recommendations";
      setRecommendationError(msg);
      setDietPlan([]);
      setWorkoutPlan([]);
    }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const analyzeFood = async () => {
    if (!selectedImage && !customFoodText.trim()) {
      alert("Please upload an image or type a custom food name!");
      return;
    }

    setIsAnalyzing(true);
    const dataToSend = new FormData();
    if (selectedImage) {
      dataToSend.append("image", selectedImage);
    }
    if (customFoodText.trim()) {
      dataToSend.append("food_name", customFoodText);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/analyze-food/",
        dataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFoodResult(response.data);
      alert("Food analyzed successfully! 🤖");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || error.message || "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addWater = () => {
    if (waterCount < waterGoal) {
      const newCount = waterCount + 1;
      setWaterCount(newCount);
      if (activeUser) {
        const todayStr = new Date().toLocaleDateString("en-CA");
        localStorage.setItem(`water_${activeUser.name}_${todayStr}`, newCount);
        fetchFoodLogs(activeUser.name);
      }
    }
  };

  const removeWater = () => {
    if (waterCount > 0) {
      const newCount = waterCount - 1;
      setWaterCount(newCount);
      if (activeUser) {
        const todayStr = new Date().toLocaleDateString("en-CA");
        localStorage.setItem(`water_${activeUser.name}_${todayStr}`, newCount);
        fetchFoodLogs(activeUser.name);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5ed] flex font-sans text-slate-800">
      {/* Sidebar Layout */}
      <div className="w-64 bg-gradient-to-b from-blue-700 to-indigo-600 text-white flex flex-col justify-between shadow-2xl transition-all duration-300">
        <div>
          <div className="p-6 border-b border-blue-500/30 flex items-center gap-3">
            <span className="text-3xl">🏥</span>
            <span className="text-xl font-bold tracking-wider text-white">AI Tracker</span>
          </div>
          <ul className="p-4 space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: "🏠" },
              { id: "profile", label: "Profile / BMI", icon: "👤" },
              { id: "diet", label: "Diet Plan & Scanner", icon: "🥗" },
              { id: "workout", label: "Workout plan", icon: "🏋" },
              { id: "water", label: "Water Intake", icon: "💧" },
              { id: "progress", label: "Progress Reports", icon: "📈" },
              { id: "ai_assist", label: "AI Assistant", icon: "🤖" },
              { id: "settings", label: "Settings", icon: "⚙" }
            ].map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition text-left text-sm font-semibold ${
                    activeTab === tab.id
                      ? "bg-white text-blue-700 shadow-lg shadow-blue-900/20"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-blue-500/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition text-left text-sm font-semibold text-red-200 hover:bg-white/10 hover:text-red-100"
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {
                {
                  dashboard: "🏠 Dashboard Overview",
                  profile: "👤 Profile / BMI",
                  diet: "🥗 Diet Plan & Scanner",
                  workout: "🏋 Workout Plan",
                  water: "💧 Water Intake",
                  progress: "📈 Progress Reports",
                  ai_assist: "🤖 AI Assistant",
                  settings: "⚙ Settings"
                }[activeTab] || "AI Tracker"
              }
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {profileName ? profileName.slice(0, 2).toUpperCase() : "US"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{profileName}</p>
                <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">{profileEmail}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content Panels */}
        <main className="p-8 flex-1 overflow-y-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="animate-fadeIn">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h1 className="text-4xl font-extrabold tracking-tight">👋 Welcome, {profileName}!</h1>
                  <p className="mt-2 text-blue-100 text-lg font-medium">
                    Personalized AI Health and Diet Planner for Chronic Disease Management.
                  </p>
                </div>
              </div>

              {/* Quick Info Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">
                    🔥
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-semibold">Calories Today</span>
                    <p className="text-lg font-bold text-slate-800">{dailyTotals.calories} kcal</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center text-xl font-bold">
                    💧
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-semibold">Water Intake</span>
                    <p className="text-lg font-bold text-slate-800">{waterCount} / {waterGoal} Glasses</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold">
                    ⚖️
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-semibold">BMI Level</span>
                    <p className="text-lg font-bold text-slate-800">{bmi || "N/A"} ({bmiStatus.split(" ")[0]})</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl font-bold">
                    🚶
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-semibold">Active Status</span>
                    <p className="text-lg font-bold text-emerald-600">🟢 Active</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Today's Nutrition Progress */}
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">🍽 Today's Nutrition Tracker</h2>
                  <span className="text-sm font-semibold text-slate-500">Remaining: {Math.max(0, dailyGoalCalories - dailyTotals.calories)} kcal</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-600">Daily Calorie Target</span>
                      <span className="font-bold text-blue-600">{dailyTotals.calories} / {dailyGoalCalories} kcal</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (dailyTotals.calories / dailyGoalCalories) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                      <span className="text-xs text-blue-600 font-bold uppercase">Protein</span>
                      <p className="text-xl font-extrabold text-blue-900 mt-1">{dailyTotals.protein.toFixed(1)}g</p>
                    </div>
                    <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4">
                      <span className="text-xs text-cyan-600 font-bold uppercase">Carbs</span>
                      <p className="text-xl font-extrabold text-cyan-900 mt-1">{dailyTotals.carbs.toFixed(1)}g</p>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                      <span className="text-xs text-emerald-600 font-bold uppercase">Fat</span>
                      <p className="text-xl font-extrabold text-emerald-900 mt-1">{dailyTotals.fat.toFixed(1)}g</p>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                      <span className="text-xs text-amber-600 font-bold uppercase">Fiber</span>
                      <p className="text-xl font-extrabold text-amber-900 mt-1">{dailyTotals.fiber.toFixed(1)}g</p>
                    </div>
                    <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 col-span-2 sm:col-span-1">
                      <span className="text-xs text-rose-600 font-bold uppercase">Sugar</span>
                      <p className="text-xl font-extrabold text-rose-900 mt-1">{dailyTotals.sugar.toFixed(1)}g</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & BMI */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">👤 Health Profile</h2>
                  <button
                    onClick={() => {
                      if (activeUser) {
                        editUser(activeUser);
                        setShowEditModal(true);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition text-sm font-semibold shadow"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold">Full Name</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{profileName}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold">Registered Email</p>
                    <p className="text-base font-bold text-slate-800 mt-1 truncate">{profileEmail}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold">Chronic Condition</p>
                    <p className="text-base font-bold text-rose-600 capitalize mt-1">{profileDisease}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold">Age Profile</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{activeUser?.age || "N/A"} years</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold">Height / Weight</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{activeUser?.height || "N/A"} cm / {activeUser?.weight || "N/A"} kg</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold">Account Status</p>
                    <p className="text-base font-bold text-emerald-600 mt-1">🟢 Active</p>
                  </div>
                </div>
              </div>

              {/* BMI Calculator */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">🩺 BMI Calculator</h2>
                <div className="max-w-md space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-sm">Height (cm)</label>
                      <input
                        type="number"
                        placeholder="Height"
                        value={bmiHeight}
                        onChange={(e) => setBmiHeight(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-sm">Weight (kg)</label>
                      <input
                        type="number"
                        placeholder="Weight"
                        value={bmiWeight}
                        onChange={(e) => setBmiWeight(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                      />
                    </div>
                  </div>
                  <button
                    onClick={calculateBMI}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md"
                  >
                    Calculate BMI
                  </button>
                  {bmi && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex justify-between items-center mt-4">
                      <div>
                        <span className="text-xs text-blue-600 font-bold uppercase">Estimated BMI</span>
                        <p className="text-3xl font-extrabold text-blue-900 mt-1">{bmi}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-bold uppercase">Status</span>
                        <p className="text-lg font-bold text-slate-800 mt-1">{bmiStatus}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIET PLAN & SCANNER */}
          {activeTab === "diet" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">📷 AI Food Image Recognition</h2>
                
                {/* Inputs Row */}
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-slate-600 font-bold mb-2 text-sm">🥗 Option A: Type Custom Food Name (Simulate Analysis)</label>
                    <input
                      type="text"
                      placeholder="e.g. Chicken Biryani"
                      value={customFoodText}
                      onChange={(e) => setCustomFoodText(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    />
                  </div>
                  <div>
                    <span className="block text-slate-600 font-bold mb-2 text-sm">📸 Option B: Upload Food Photo</span>
                    <div className="flex gap-4">
                      <input
                        type="file"
                        id="cameraInput"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <input
                        type="file"
                        id="galleryInput"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="cameraInput"
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition font-bold text-center text-sm shadow"
                      >
                        📷 Camera Photo
                      </label>
                      <label
                        htmlFor="galleryInput"
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl cursor-pointer hover:bg-purple-700 transition font-bold text-center text-sm shadow"
                      >
                        🖼 Gallery Upload
                      </label>
                    </div>
                  </div>
                  {preview && (
                    <div className="mt-4">
                      <span className="block text-slate-400 text-xs font-bold uppercase mb-2">Image Preview</span>
                      <img src={preview} alt="Food Preview" className="w-56 h-40 object-cover rounded-2xl border shadow-sm" />
                    </div>
                  )}
                  <button
                    onClick={analyzeFood}
                    disabled={isAnalyzing}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-lg font-bold rounded-xl transition shadow-lg mt-4 flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? "⏳ Analyzing Food..." : "🤖 Analyze Food"}
                  </button>
                </div>

                {/* Scanned Results */}
                {foodResult && (
                  <div className="mt-8 p-6 border border-emerald-100 rounded-3xl bg-emerald-50/20 shadow-md">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-3xl font-extrabold text-slate-900">🍔 {foodResult.food_name}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold px-3 py-1 bg-white border rounded-full">
                          Confidence: {foodResult.confidence_score || "N/A"}
                        </span>
                        <span className="text-lg">{foodResult.risk_level}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-slate-400 text-xs font-bold block">Calories</span>
                        <p className="text-xl font-bold text-slate-800 mt-1">{foodResult.calories} kcal</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-slate-400 text-xs font-bold block">Protein</span>
                        <p className="text-xl font-bold text-slate-800 mt-1">{foodResult.protein}g</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-slate-400 text-xs font-bold block">Carbohydrates</span>
                        <p className="text-xl font-bold text-slate-800 mt-1">{foodResult.carbs}g</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-slate-400 text-xs font-bold block">Fat</span>
                        <p className="text-xl font-bold text-slate-800 mt-1">{foodResult.fat}g</p>
                      </div>
                    </div>

                    {/* Micro Ingredients & Health Score */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <h4 className="font-bold text-slate-900 border-b pb-1 text-sm">🧪 Micro-Nutritional Details</h4>
                        <p className="text-sm"><strong>Sugar:</strong> {foodResult.sugar || "0"}g</p>
                        <p className="text-sm"><strong>Fiber:</strong> {foodResult.fiber || "0"}g</p>
                        <p className="text-sm"><strong>Sodium:</strong> {foodResult.sodium || "0"}mg</p>
                        <p className="text-sm"><strong>Portion Size:</strong> {foodResult.portion}</p>
                        <p className="text-sm"><strong>Vitamins:</strong> {Array.isArray(foodResult.vitamins) ? foodResult.vitamins.join(", ") : foodResult.vitamins || "N/A"}</p>
                        <p className="text-sm"><strong>Minerals:</strong> {Array.isArray(foodResult.minerals) ? foodResult.minerals.join(", ") : foodResult.minerals || "N/A"}</p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <h4 className="font-bold text-slate-900 border-b pb-1 text-sm">📈 AI Health Metrics</h4>
                        <p className="text-sm"><strong>Health Score:</strong> {foodResult.health_score} / 10</p>
                        <p className="text-sm"><strong>Daily Intake Percentage:</strong> {foodResult.daily_intake_percentage || "0%"}</p>
                        <p className="text-sm text-emerald-800"><strong>💡 Better Alternative:</strong> {foodResult.better_healthy_alternative || "None needed"}</p>
                      </div>
                    </div>

                    {/* Chronic Disease Advice */}
                    {foodResult.disease_advice && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 mb-6">
                        <h4 className="font-bold text-slate-900 border-b pb-1 text-sm">👨‍⚕️ Disease-Based AI Recommendation</h4>
                        <div className="text-sm">
                          {(!profileDisease || profileDisease.toLowerCase().includes("diabetes")) && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                              <span className="font-bold text-red-800 text-xs block mb-1">📋 Diabetes Diet Guideline</span>
                              <p className="text-red-950 leading-relaxed font-medium">{foodResult.disease_advice.diabetes}</p>
                            </div>
                          )}
                          {profileDisease && profileDisease.toLowerCase().includes("hypertension") && (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                              <span className="font-bold text-amber-800 text-xs block mb-1">📋 Hypertension Diet Guideline</span>
                              <p className="text-amber-950 leading-relaxed font-medium">{foodResult.disease_advice.hypertension}</p>
                            </div>
                          )}
                          {profileDisease && profileDisease.toLowerCase().includes("obesity") && (
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                              <span className="font-bold text-blue-800 text-xs block mb-1">📋 Obesity Diet Guideline</span>
                              <p className="text-blue-950 leading-relaxed font-medium">{foodResult.disease_advice.obesity}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}



                    <button
                      onClick={saveMeal}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-lg"
                    >
                      💾 Save Meal to Today's Food Log
                    </button>
                  </div>
                )}
              </div>

              {/* Food Logs history */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">📅 Daily Food Log History</h2>
                {foodLogs.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">No meals logged today. Use the scanner above to record a meal!</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {foodLogs.map((log) => (
                      <div key={log.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 bg-slate-50/50 rounded-2xl gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl shadow-inner font-bold">
                            🥗
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{log.food_name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(log.created_at).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })} - Portion: {log.portion || "Standard"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">
                            🔥 {log.calories} kcal
                          </span>
                          <span className="text-xs text-slate-400 font-semibold hidden md:inline">
                            P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                  Note: Nutritional values are AI-generated estimates based on the detected food, estimated portion size, ingredients, and cooking method. Actual nutritional values may vary.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: WORKOUT PLAN */}
          {activeTab === "workout" && (
            <div className="animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">🏋 AI Personalized Workout Guidelines</h2>
                {workoutPlan && workoutPlan.length > 0 ? (
                  <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-orange-800 mb-4">💪 Recommended Activities</h3>
                    <ul className="space-y-3">
                      {workoutPlan.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-orange-950 font-medium text-sm leading-relaxed">
                          <span className="text-orange-500 font-semibold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-slate-400">No workout guidelines loaded. Check your User Profile chronic disease setting.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: WATER INTAKE */}
          {activeTab === "water" && (
            <div className="animate-fadeIn">
              <div className="bg-cyan-50/30 border border-cyan-100 p-8 rounded-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-cyan-800 mb-4">💧 Daily Water Intake Tracker</h2>
                <p className="text-slate-500 text-sm mb-6">Target intake goal is {waterGoal} glasses per day.</p>
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={removeWater} className="bg-red-400 text-white px-5 py-3 rounded-xl hover:bg-red-500 font-bold transition shadow-sm">
                    ➖ Remove
                  </button>
                  <span className="text-3xl font-extrabold text-slate-800">
                    {waterCount} Glasses
                  </span>
                  <button onClick={addWater} className="bg-green-500 text-white px-5 py-3 rounded-xl hover:bg-green-600 font-bold transition shadow-sm">
                    ➕ Add Glass
                  </button>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(waterCount / waterGoal) * 100}%` }}
                  ></div>
                </div>
                <p className="mt-3 text-sm text-slate-600 font-semibold">
                  {((waterCount / waterGoal) * 100).toFixed(1)}% of daily water target met.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: PROGRESS REPORTS */}
          {activeTab === "progress" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">📈 Weekly Calorie Intake (kcal)</h3>
                  <div className="h-64">
                    {weeklyCalorieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyCalorieData}>
                          <defs>
                            <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                          <Area type="monotone" dataKey="Calories" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorCal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">Generating chart...</div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">💧 Weekly Water Intake (Glasses)</h3>
                  <div className="h-64">
                    {weeklyWaterData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyWaterData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                          <Bar dataKey="Glasses" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">Generating chart...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AI ASSISTANT */}
          {activeTab === "ai_assist" && (
            <div className="space-y-8 animate-fadeIn">
              {/* AI Health Insights */}
              <div className="bg-white rounded-3xl border border-sky-100 p-8 shadow-sm bg-gradient-to-br from-white to-sky-50/20">
                <h2 className="text-2xl font-bold text-sky-900 mb-4 flex items-center gap-2">🤖 Daily AI Health Insights</h2>
                {insightsLoading ? (
                  <div className="py-6 text-sky-600 font-semibold flex items-center gap-2">
                    <span className="animate-spin text-lg">⏳</span> Generating health assessment...
                  </div>
                ) : insights ? (
                  <div className="space-y-3 text-sky-950 font-medium text-sm leading-relaxed whitespace-pre-line bg-white/80 p-5 rounded-2xl border border-sky-50 shadow-inner">
                    {insights}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Save your meals to log metrics and get health insights.</p>
                )}
              </div>

              {/* Personalized AI Recommendations */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">✨ Personalized Disease Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-emerald-800 mb-4">🥗 Recommended Diet Plan</h3>
                    {dietPlan && dietPlan.length > 0 ? (
                      <ul className="space-y-3">
                        {dietPlan.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-emerald-950 font-medium text-sm leading-relaxed">
                            <span className="text-emerald-500 font-semibold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-sm">No diet recommendations available. Check your Profile.</p>
                    )}
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-orange-800 mb-4">🏋 Recommended Exercise plan</h3>
                    {workoutPlan && workoutPlan.length > 0 ? (
                      <ul className="space-y-3">
                        {workoutPlan.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-orange-950 font-medium text-sm leading-relaxed">
                            <span className="text-orange-500 font-semibold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-sm">No workout guidelines available. Check your Profile.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === "settings" && (
            <div className="animate-fadeIn">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">⚙ Account Settings</h2>
                <p className="text-slate-400 text-sm mb-6">Configure profile specifics or manage accounts.</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (activeUser) {
                        editUser(activeUser);
                        setShowEditModal(true);
                      }
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow"
                  >
                    ✏️ Configure Health Profile Info
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Profile Configure Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scaleUp">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-2xl focus:outline-none"
            >
              ✕
            </button>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6">
              {editingId ? "✏️ Configure Profile" : "➕ Create Profile"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-sm">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-xs">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-xs">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-xs">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-sm">Chronic Disease Condition</label>
                <select
                  name="disease_type"
                  value={formData.disease_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                  required
                >
                  <option value="diabetes">Diabetes</option>
                  <option value="hypertension">Hypertension</option>
                  <option value="obesity">Obesity</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition mt-6 shadow-lg shadow-blue-500/20"
              >
                Save Health Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;