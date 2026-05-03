import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [file, setFile] = useState(null);
  const [topics, setTopics] = useState([]);
  const [plan, setPlan] = useState([]);
  const [coverage, setCoverage] = useState({ covered: [], missing: [] });
  const [practice, setPractice] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("Backend response:", data);

      setTopics(data.topics || []);
      setPlan(data.plan || []);
      setCoverage(data.coverage || { covered: [], missing: [] });
      setPractice(data.practice || []);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  const chartData = {
    labels: topics.map(t => t.topic),
    datasets: [
      {
        label: "Topic Frequency",
        data: topics.map(t => t.count),
      }
    ]
  };

  const doughnutData = {
    labels: topics.map(t => t.topic),
    datasets: [
      {
        data: topics.map(t => t.count),
        backgroundColor: [
          "#667eea","#764ba2","#43cea2","#f7971e",
          "#ff6a00","#00c6ff","#f953c6","#11998e",
          "#ee0979","#ff512f"
        ]
      }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #e0e7ff, #f4f6fb)",
        padding: "0",
        fontFamily: "Arial",
        overflowX: "hidden"
      }}
    >

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          width: "100%",
          padding: "30px",
          boxSizing: "border-box"
        }}
      >

        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          📊 Past Paper Analyzer
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: "center" }}
        >
          <input type="file" onChange={handleFileChange} />
          <br /><br />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpload}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              boxShadow: "0 8px 20px rgba(102,126,234,0.4)",
              transition: "0.2s",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Upload & Analyze
          </motion.button>

          {file && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              📄 {file.name}
            </motion.p>
          )}
        </motion.div>

        <div style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
          alignItems: "flex-start",
          flexWrap: "wrap"
        }}>

          {/* LEFT SIDE */}
          <div style={{ flex: "2 1 500px" }}>

            <h2>📊 Topic Analytics</h2>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "20px",
                background: "#f9fafc",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                height: "300px"   // ✅ FIXED SIZE HERE
              }}
            >
              <Bar
                key={topics.length}
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                marginTop: "20px",
                padding: "20px",
                background: "#f9fafc",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
              }}
            >
              <h3>📊 Topic Distribution</h3>

              <div style={{
                height: "300px",
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px"
              }}>
                <Doughnut key={topics.length} data={doughnutData} />
              </div>

              <h3>Top Topics</h3>

              {topics?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    marginBottom: "8px",
                    background: "white",
                    transition: "0.2s",
                    cursor: "pointer",
                    borderRadius: "10px"
                  }}
                >
                  <span><strong>{item.topic}</strong></span>
                  <span>{item.count} ⭐ {item.score} | {item.difficulty}</span>
                </motion.div>
              ))}
            </motion.div>

          </div>

          {/* RIGHT SIDE */}
          <div style={{ flex: "1 1 300px" }}>

            <h2>📅 Study Plan</h2>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "20px",
                background: "#f9fafc",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
              }}
            >
              {plan?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    padding: "12px",
                    marginBottom: "10px",
                    borderRadius: "10px",
                    background: item.focus.includes("High") ? "#d4edda" : "#fff3cd"
                  }}
                >
                  {item.day} → {item.topic}
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div style={{
                marginTop: "20px",
                padding: "20px",
                background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
              }}>
                <h3>🤖 AI Insights</h3>

                <p>🔹 Most important topic: <b>{topics[0]?.topic || "N/A"}</b></p>
                <p>🔹 Focus on top 3 topics before exam</p>
                <p>🔹 High-frequency topics likely to repeat</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div style={{
                marginTop: "20px",
                padding: "20px",
                background: "#e6fffa",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
              }}>
                <h3>📚 Syllabus Coverage</h3>
                <p>✅ Covered: {coverage?.covered?.join(", ") || "No data"}</p>
                <p>❌ Missing: {coverage?.missing?.join(", ") || "No data"}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <div style={{
                marginTop: "20px",
                padding: "20px",
                background: "#fff7ed",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
              }}>
                <h3>📘 Practice Suggestions</h3>

                {practice?.slice(0, 5).map((p, i) => (
                  <p key={i}>🔹 {p.suggestion}</p>
                ))}
              </div>
            </motion.div>

          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

export default App;