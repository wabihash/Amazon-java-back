import axios from "axios";
import { auth } from "../Utility/Firebase";

const waitForCurrentUser = () =>
  new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });

const getFirebaseToken = async () => {
  const currentUser = auth.currentUser || (await waitForCurrentUser());

  if (!currentUser) {
    return null;
  }

  return currentUser.getIdToken();
};

const instance = axios.create({
  // Use the Vite dev proxy so browser requests stay same-origin in development.
  // Override this in .env when your backend is deployed somewhere else.
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

instance.interceptors.request.use(
  async (config) => {
    const token = await getFirebaseToken();

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
