import React, { useEffect,useContext} from 'react';
import './App.css';
import Routing from './Routing';
import { DataContext } from './Components/DataProvider/DataProvider';
import { auth, db } from './Utility/Firebase';
import { Type } from './Utility/ActionType';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
 const [{ theme }, dispatch] = useContext(DataContext);
  useEffect(() => {
    dispatch({
      type: Type.SET_AUTH_LOADING,
      status: true
    })
    auth.onAuthStateChanged(async (authUser) => {
      // Set authLoading to true whenever the auth state changes (login, logout, refresh)
      dispatch({
        type: Type.SET_AUTH_LOADING,
        status: true
      });

      if (authUser) {
        // 1. Dispatch essential user info immediately to prevent ProtectedRoute from bouncing
        dispatch({
          type: Type.SET_USER,
          user: {
            uid: authUser.uid,
            email: authUser.email,
            firstName: authUser.email?.split("@")[0] || "User"
          }
        });

        try {
          const userDoc = await db.collection("users").doc(authUser.uid).get();
          
          let userToSet;
          if (userDoc.exists) {
            const userData = userDoc.data();
            userToSet = { 
              uid: authUser.uid,
              email: authUser.email,
              role: userData.role || "user", 
              firstName: userData.firstName || authUser.email?.split("@")[0] || "User"
            };
          } else {
            userToSet = { 
              uid: authUser.uid,
              email: authUser.email,
              role: "user", 
              firstName: authUser.email?.split("@")[0] || "User"
            };
          }

          // 2. Enhance the user object with profile data (role, full name, etc.)
          dispatch({
            type: Type.SET_USER,
            user: userToSet
          });
        } catch (error) {
          console.error("Error fetching Firestore profile:", error);
          // Fallback is already handled by the immediate dispatch above
        }
      } else {
        dispatch({
          type: Type.SET_USER,
          user: null
        });
      }

      dispatch({
        type: Type.SET_AUTH_LOADING,
        status: false
      });
    }, (error) => {
      console.error("onAuthStateChanged ERROR:", error);
      dispatch({
        type: Type.SET_AUTH_LOADING,
        status: false
      });
    });
  }, [dispatch]);
  
  return (
    <div className={theme}>
      <Routing />
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  )
}

export default App;
