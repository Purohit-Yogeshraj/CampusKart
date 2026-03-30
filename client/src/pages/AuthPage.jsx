import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const data = await login({
        email: form.get("email"),
        pass: form.get("pass"),
      });
      alert(data.message);
      navigate(redirectTo);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const data = await signup({
        username: form.get("username"),
        gender: form.get("gender"),
        dob: form.get("dob"),
        email: form.get("email"),
        contact: form.get("contact"),
        pass1: form.get("pass1"),
        pass2: form.get("pass2"),
      });
      alert(data.message);
      event.currentTarget.reset();
      setActiveTab("login");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/images/logo.png" alt="CampusKart Logo" className="auth-logo" />
            <h2>Welcome to CampusKart</h2>
            <p>Trade smart with your campus community</p>
            <a href="/" className="back-home">← Back to Home</a>
          </div>
          <div className="auth-toggle">
            <button type="button" className={`toggle-btn ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>
              Login
            </button>
            <button type="button" className={`toggle-btn ${activeTab === "signup" ? "active" : ""}`} onClick={() => setActiveTab("signup")}>
              Sign Up
            </button>
          </div>
          <div className={`auth-form ${activeTab === "login" ? "active" : ""}`} id="login-form">
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="login-email"><i className="fas fa-envelope"></i> Email</label>
                <input type="email" id="login-email" name="email" placeholder="Enter your email" required />
              </div>
              <div className="input-group">
                <label htmlFor="login-password"><i className="fas fa-lock"></i> Password</label>
                <input type="password" id="login-password" name="pass" placeholder="Enter your password" required />
              </div>
              <button type="submit" className="auth-btn">Login</button>
              <div className="auth-footer">
                <a href="#">Forgot Password?</a>
              </div>
            </form>
          </div>
          <div className={`auth-form ${activeTab === "signup" ? "active" : ""}`} id="signup-form">
            <form id="signup-form-full" onSubmit={handleSignup}>
              <div className="input-group">
                <label htmlFor="signup-name"><i className="fas fa-user"></i> Full Name</label>
                <input type="text" id="signup-name" name="username" placeholder="Enter your full name" required />
              </div>
              <div className="input-group">
                <label><i className="fas fa-venus-mars"></i> Gender</label>
                <div className="gender-group">
                  <label className="radio-label"><input type="radio" name="gender" value="male" required /> Male</label>
                  <label className="radio-label"><input type="radio" name="gender" value="female" /> Female</label>
                  <label className="radio-label"><input type="radio" name="gender" value="other" /> Other</label>
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="signup-dob"><i className="fas fa-calendar-alt"></i> Date of Birth</label>
                <input type="date" id="signup-dob" name="dob" required />
              </div>
              <div className="input-group">
                <label htmlFor="signup-email"><i className="fas fa-envelope"></i> Gmail</label>
                <input type="email" id="signup-email" name="email" placeholder="Enter your Gmail" required />
              </div>
              <div className="input-group">
                <label htmlFor="signup-phone"><i className="fas fa-phone"></i> Contact Number</label>
                <input type="tel" id="signup-phone" name="contact" placeholder="Enter 10-digit number" pattern="[0-9]{10}" required />
              </div>
              <div className="input-group">
                <label htmlFor="signup-password"><i className="fas fa-lock"></i> Password</label>
                <input type="password" id="signup-password" name="pass1" placeholder="Create a password" required minLength="6" />
              </div>
              <div className="input-group">
                <label htmlFor="signup-confirm-password"><i className="fas fa-lock"></i> Confirm Password</label>
                <input type="password" id="signup-confirm-password" name="pass2" placeholder="Re-enter password" required />
              </div>
              <button type="submit" className="auth-btn">Sign Up</button>
              <div className="auth-footer">
                <p>By signing up, you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
