import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

//  add test route directly here
app.get("/test-compression", (req, res) => {
  const data = { message: "test ".repeat(500) };
  res.json(data);
});

app.on("error", (error) => {
  console.log("App Error:", error);
  throw error;
});

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed:", err);
  });