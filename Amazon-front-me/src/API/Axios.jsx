import axios from "axios";

const instance = axios.create({
  // 1. Local Java Backend Instance
  baseURL: "http://localhost:8080",
  
  // 2. Render Instance of the backend (Commented out for local testing)
  // baseURL: "https://amazon-me-rd5s.onrender.com"
  
  // 3. Old Firebase Function Instance (Not active)
  // baseURL: "http://127.0.0.1:5001/backend-22770/us-central1/api",
});

export default instance;