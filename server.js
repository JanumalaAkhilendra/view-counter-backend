require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;
const filePath = path.join(__dirname, "views.json");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "default-secret"; 

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Load view counts or initialize file
let viewsData = {};
if (fs.existsSync(filePath)) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    viewsData = JSON.parse(data) || {};
  } catch (error) {
    console.error("Error reading views.json:", error);
    viewsData = {};
  }
} else {
  fs.writeFileSync(filePath, JSON.stringify({}));
}

// 📌 API to increment view count for a specific page
app.get("/increment", (req, res) => {
  const page = req.query.page; // Example: "/index.html"

  if (!page) return res.status(400).json({ error: "Page parameter is required" });

  viewsData[page] = (viewsData[page] || 0) + 1;

  fs.writeFileSync(filePath, JSON.stringify(viewsData, null, 2));
  
  res.json({ message: `View count updated for ${page}`, views: viewsData[page] });
});

// 📌 API for admin to see all views
app.get("/admin/views", (req, res) => {
  const token = req.headers.token;
  console.log("Received Token:", token);

  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  res.json(viewsData);
});

app.listen(PORT, () => console.log(`Server Deployed`));
