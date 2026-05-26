import React, { useState } from 'react';
import classes from './Auth.module.css';
import { Link,useNavigate,useLocation} from 'react-router-dom';
import { auth, db } from '../../Utility/Firebase';
// Removed modular imports to use compat API consistently
import { ClipLoader } from "react-spinners";
import { toast } from 'react-toastify';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(''); // Added firstName state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    signin: false,
    signup: false,
  });
  const navigate = useNavigate()
  const navStateData = useLocation();
  const authHandler = async (e, actionType) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // If no actionType is passed (e.g. hitting ENTER on form), default to 'signin'
    const action = actionType || 'signin';

    if (action === 'signin') {
      if (loading.signin || loading.signup) return;
      setLoading({ ...loading, signin: true });
      setError('');
      
      try {
        await auth.signInWithEmailAndPassword(email, password);
        toast.success("Welcome back!");
        // Small delay to allow Firebase global state (onAuthStateChanged) to settle
        setTimeout(() => {
          setLoading(prev => ({ ...prev, signin: false }));
          navigate(navStateData?.state?.redirect || '/');
        }, 300);
      } catch (err) {
        toast.error(err.message);
        setError(err.message);
        setLoading(prev => ({ ...prev, signin: false }));
      }
    } else if (action === 'signup') {
      if (loading.signin || loading.signup) return;
      
      // Validate first name for signup
      if (!firstName.trim()) {
        setError("Please enter your First Name to register.");
        toast.warn("First Name is required for registration");
        return;
      }

      setLoading({...loading, signup: true});
      setError('');

      try {
        const userInfo = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user document in Firestore on signup
        await db.collection("users").doc(userInfo.user.uid).set({
          email: userInfo.user.email,
          firstName: firstName,
          role: "user",
          created: new Date()
        });

        toast.success("Account created successfully!");
        setTimeout(() => {
          setLoading(prev => ({ ...prev, signup: false }));
          navigate(navStateData?.state?.redirect || '/');
        }, 300);
      } catch (err) {
        toast.error(err.message);
        setError(err.message);
        setLoading(prev => ({ ...prev, signup: false }));
      }
    }
  };

  return (
    <section className={classes.login}>
      {/* Logo with Link to home */}
      <Link to="/">
        <img src="Amazon-logo.png" alt="Amazon Logo" />
      </Link>
      
      {/* form */}
      <div className={classes.Login_container}>
        <h1>Sign In / Register</h1>
        {
          navStateData?.state?.msg && (
            <small style={{padding: "5px", color: "red", display: "block", marginTop: "10px"}}>
              {navStateData?.state?.msg}
            </small>
          )
        }
        <form onSubmit={(e) => authHandler(e, 'signin')}>
          {/* First Name field (Visible for registration) */}
          <div>
            <label htmlFor="firstName">First Name (Required for Registration)</label>
            <input 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              type="text" 
              id='firstName' 
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }} 
              type="email" 
              id='email' 
              required
            />
          </div>
          
          <div>
            <label htmlFor="password">Password</label>
            <input 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }} 
              type="password" 
              id="password" 
              required
            />
          </div>
          
          <button 
            type='submit' // Primary submit action
            className={classes.login_signInButton}
            disabled={loading.signin || loading.signup}
          >
            {loading.signin ? (
              <ClipLoader color='#36d7b7' size={15} />
            ) : "Sign In"}
          </button>

          {/* agreement */}
          <p>
            By signing-in you agree to the AMAZON FAKE CLONE Conditions of Use & Sale. 
            Please see our Privacy Notice, our Cookies Notice and our Interest-Based Ads Notice.
          </p>

          {/* create account btn */}
          <button 
            type='button' // Secondary action: explicitly NOT submit to avoid form-action conflict
            onClick={(e) => authHandler(e, 'signup')}
            className={classes.login_registerButton}
            disabled={loading.signin || loading.signup}
          >
            {loading.signup ? (
              <ClipLoader color='#36d7b7' size={15} />
            ) : "Create your Amazon Account"}
          </button>
        </form>

        {error && (
          <small style={{padding: "5px", color: "red", display: "block", marginTop: "10px"}}>
            {error}
          </small>
        )}
      </div>
    </section>
  );
}

export default Auth;