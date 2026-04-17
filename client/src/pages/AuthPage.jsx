import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchColleges } from "../utils/colleges";
import { request, API_BASE_URL } from "../utils/api";

export function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";
  const [idCardFile, setIdCardFile] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);
  const [collegeLoadError, setCollegeLoadError] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [statusEmail, setStatusEmail] = useState("");

  useEffect(() => {
    fetchColleges()
      .then((items) => {
        setColleges(items);
      })
      .catch((error) => {
        console.error("Failed to load colleges", error);
        setCollegeLoadError(
          error?.message || "Unable to load colleges at this time",
        );
      })
      .finally(() => {
        setCollegesLoading(false);
      });
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const data = await login({
        email: form.get("email"),
        pass: form.get("pass"),
      });
      alert(data.message);
      if (data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectTo);
      }
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    if (!idCardFile) {
      alert("Please upload your college ID card to complete signup.");
      return;
    }

    // Forcefully attach the file to bypass browser quirks that drop files
    form.set("idCard", idCardFile);

    try {
      const data = await signup(form); // The 'form' natively contains the idCard file and all inputs!
      alert(data.message);
      formElement.reset();
      setIdCardFile(null);
      setActiveTab("login");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleCheckStatus(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email");
    try {
      const data = await request("/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          pass: form.get("pass"),
        }),
      });
      setStatusResult(data.user);
      setStatusEmail(email);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleReapply(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    if (!statusEmail) return alert("Missing email. Please check status again.");
    form.append("email", statusEmail);

    if (!idCardFile) return alert("Please upload a new ID card.");
    form.set("idCard", idCardFile);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reapply`, {
        method: "POST",
        body: form,
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Server response invalid.");
      }
      if (!response.ok)
        throw new Error(data?.message || "Re-submission failed");

      alert(data.message);
      setStatusResult(null);
      setIdCardFile(null);
      formElement.reset();
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await request("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      alert(data.message);
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
            <img
              src="/images/logo.png"
              alt="CampusKart Logo"
              className="auth-logo"
            />
            <h2>Welcome to CampusKart</h2>
            <p>Trade smart with your campus community</p>
            <a href="/" className="back-home">
              Back to Home
            </a>
          </div>
          <div className="auth-toggle">
            <button
              type="button"
              className={`toggle-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("login");
                setStatusResult(null);
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`toggle-btn ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("signup");
                setStatusResult(null);
              }}
            >
              Sign Up
            </button>
            <button
              type="button"
              className={`toggle-btn ${activeTab === "status" ? "active" : ""}`}
              onClick={() => setActiveTab("status")}
            >
              Check Status
            </button>
          </div>
          <div
            className={`auth-form ${activeTab === "login" ? "active" : ""}`}
            id="login-form"
          >
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="login-email">
                  <i className="fas fa-envelope"></i> Email
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="login-password">
                  <i className="fas fa-lock"></i> Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  name="pass"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <button type="submit" className="auth-btn">
                Login
              </button>
              <div className="auth-footer">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("forgot");
                  }}
                >
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>
          <div
            className={`auth-form ${activeTab === "signup" ? "active" : ""}`}
            id="signup-form"
          >
            <form id="signup-form-full" onSubmit={handleSignup}>
              <div className="form-section-title">Personal Information</div>
              <div className="input-group">
                <label htmlFor="signup-name">
                  <i className="fas fa-user"></i> Full Name
                </label>
                <input
                  type="text"
                  id="signup-name"
                  name="username"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="input-group">
                <label>
                  <i className="fas fa-venus-mars"></i> Gender
                </label>
                <div className="gender-group">
                  <label className="radio-label">
                    <input type="radio" name="gender" value="male" required />{" "}
                    Male
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="gender" value="female" /> Female
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="gender" value="other" /> Other
                  </label>
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="signup-dob">
                  <i className="fas fa-calendar-alt"></i> Date of Birth
                </label>
                <input type="date" id="signup-dob" name="dob" required />
              </div>
              <div className="input-group">
                <label htmlFor="signup-email">
                  <i className="fas fa-envelope"></i> Campus Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  placeholder="you@gmail.com"
                  required
                />
                <small>
                  Use your Google account (@gmail.com) to register and receive
                  password reset links.
                </small>
              </div>
              <div className="input-group">
                <label htmlFor="signup-phone">
                  <i className="fas fa-phone"></i> Contact Number
                </label>
                <input
                  type="tel"
                  id="signup-phone"
                  name="contact"
                  placeholder="Enter 10-digit number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="form-section-title">Academic Details (VNSGU)</div>
              <div className="input-group">
                <label htmlFor="signup-spid">
                  <i className="fas fa-id-card"></i> SPID
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="signup-spid"
                  name="spid"
                  placeholder="Enter 10-digit SPID"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
                <small>SPID must be exactly 10 digits.</small>
              </div>
              <div className="input-group">
                <label htmlFor="signup-college">
                  <i className="fas fa-school"></i> College
                </label>
                <select
                  id="signup-college"
                  name="college"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    {collegesLoading
                      ? "Loading colleges..."
                      : collegeLoadError
                        ? "Unable to load colleges"
                        : colleges.length
                          ? "Select your college"
                          : "No colleges available"}
                  </option>
                  {colleges.map((college) => (
                    <option key={college.slug} value={college.name}>
                      {college.name}
                    </option>
                  ))}
                </select>
                {collegeLoadError && (
                  <small className="error-text">{collegeLoadError}</small>
                )}
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="signup-department">
                    <i className="fas fa-book"></i> Department
                  </label>
                  <select
                    id="signup-department"
                    name="department"
                    required
                    defaultValue="BCA"
                  >
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="M.Sc">M.Sc</option>
                    <option value="B.A">B.A</option>
                    <option value="M.A">M.A</option>
                    <option value="B.Com">B.Com</option>
                    <option value="M.Com">M.Com</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="signup-semester">
                    <i className="fas fa-layer-group"></i> Semester
                  </label>
                  <select
                    id="signup-semester"
                    name="semester"
                    required
                    defaultValue="1"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="signup-year">
                  <i className="fas fa-graduation-cap"></i> Expected Passing
                  Year
                </label>
                <input
                  type="number"
                  id="signup-year"
                  name="passingYear"
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 10}
                  required
                />
              </div>

              <div className="form-section-title">Verification</div>
              <div className="input-group">
                <label htmlFor="signup-id">
                  <i className="fas fa-camera"></i> Upload College ID Card
                </label>
                <input
                  type="file"
                  id="signup-id"
                  name="idCard"
                  accept="image/*"
                  required
                  onChange={(e) => setIdCardFile(e.target.files?.[0])}
                />
                <small>
                  Upload a clear college ID photo. Your account can browse
                  immediately, but only verified students can post items.
                </small>
              </div>

              <div className="form-section-title">Security</div>
              <div className="input-group">
                <label htmlFor="signup-password">
                  <i className="fas fa-lock"></i> Password
                </label>
                <input
                  type="password"
                  id="signup-password"
                  name="pass1"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  minLength="6"
                />
              </div>
              <div className="input-group">
                <label htmlFor="signup-confirm-password">
                  <i className="fas fa-lock"></i> Confirm Password
                </label>
                <input
                  type="password"
                  id="signup-confirm-password"
                  name="pass2"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </div>
              <button type="submit" className="auth-btn">
                Sign Up
              </button>
              <div className="auth-footer">
                <p>
                  By signing up, you agree to our <a href="#">Terms</a> and{" "}
                  <a href="#">Privacy Policy</a>
                </p>
              </div>
            </form>
          </div>
          <div
            className={`auth-form ${activeTab === "status" ? "active" : ""}`}
            id="status-form"
          >
            {!statusResult ? (
              <form onSubmit={handleCheckStatus}>
                <div className="input-group">
                  <label htmlFor="status-email">
                    <i className="fas fa-envelope"></i> Email
                  </label>
                  <input
                    type="email"
                    id="status-email"
                    name="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="status-password">
                    <i className="fas fa-lock"></i> Password
                  </label>
                  <input
                    type="password"
                    id="status-password"
                    name="pass"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button type="submit" className="auth-btn">
                  Check Status
                </button>
              </form>
            ) : (
              <div className="status-result">
                <h3 style={{ textAlign: "center", marginBottom: "15px" }}>
                  Hello, {statusResult.username}
                </h3>

                {statusResult.isVerified ||
                statusResult.idCardStatus === "verified" ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      backgroundColor: "#e8f8f5",
                      color: "#27ae60",
                      borderRadius: "8px",
                      border: "1px solid #27ae60",
                      marginBottom: "15px",
                    }}
                  >
                    <i
                      className="fas fa-check-circle"
                      style={{ fontSize: "40px", marginBottom: "10px" }}
                    ></i>
                    <h4>Account Verified!</h4>
                    <p>
                      Your account is fully verified. You can now log in and
                      access all features.
                    </p>
                  </div>
                ) : statusResult.idCardStatus === "pending" ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      backgroundColor: "#fef9e7",
                      color: "#f39c12",
                      borderRadius: "8px",
                      border: "1px solid #f39c12",
                      marginBottom: "15px",
                    }}
                  >
                    <i
                      className="fas fa-clock"
                      style={{ fontSize: "40px", marginBottom: "10px" }}
                    ></i>
                    <h4>Verification Pending</h4>
                    <p>
                      Please wait while our admins review your ID card
                      submission.
                    </p>
                  </div>
                ) : statusResult.idCardStatus === "rejected" ? (
                  <div
                    style={{
                      padding: "20px",
                      backgroundColor: "#fef0f0",
                      color: "#e74c3c",
                      borderRadius: "8px",
                      border: "1px solid #e74c3c",
                      marginBottom: "15px",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <i
                        className="fas fa-times-circle"
                        style={{ fontSize: "40px", marginBottom: "10px" }}
                      ></i>
                      <h4>Verification Rejected</h4>
                    </div>
                    <p>
                      <strong>Reason:</strong>{" "}
                      {statusResult.rejectionReason || "Details did not match."}
                    </p>
                    <hr style={{ borderColor: "#fadbd8", margin: "15px 0" }} />
                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: "15px",
                        textAlign: "center",
                      }}
                    >
                      Please update your info and upload a clear ID card to
                      reapply.
                    </p>

                    <form onSubmit={handleReapply}>
                      <div className="input-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="username"
                          defaultValue={statusResult.username}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Gender</label>
                        <select
                          name="gender"
                          defaultValue={statusResult.gender}
                          required
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          defaultValue={
                            statusResult.dob
                              ? new Date(statusResult.dob)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Contact Number</label>
                        <input
                          type="tel"
                          name="contact"
                          defaultValue={statusResult.contact}
                          required
                          pattern="[0-9]{10}"
                        />
                      </div>
                      <div className="input-group">
                        <label>SPID</label>
                        <input
                          type="text"
                          name="spid"
                          defaultValue={statusResult.enrollmentNo}
                          required
                          pattern="[0-9]{10}"
                        />
                      </div>
                      <div className="input-group">
                        <label>College</label>
                        <select
                          name="college"
                          defaultValue={statusResult.college}
                          required
                        >
                          {colleges.map((college) => (
                            <option key={college.slug} value={college.name}>
                              {college.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Department</label>
                        <select
                          name="department"
                          defaultValue={statusResult.department}
                          required
                        >
                          <option value="BCA">BCA</option>
                          <option value="MCA">MCA</option>
                          <option value="B.Sc">B.Sc</option>
                          <option value="M.Sc">M.Sc</option>
                          <option value="B.A">B.A</option>
                          <option value="M.A">M.A</option>
                          <option value="B.Com">B.Com</option>
                          <option value="M.Com">M.Com</option>
                          <option value="Engineering">Engineering</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Semester</label>
                        <select
                          name="semester"
                          defaultValue={statusResult.semester}
                          required
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>
                              Semester {sem}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Passing Year</label>
                        <input
                          type="number"
                          name="passingYear"
                          defaultValue={statusResult.passingYear}
                          required
                          min={new Date().getFullYear()}
                          max={new Date().getFullYear() + 10}
                        />
                      </div>
                      <div className="input-group">
                        <label>
                          <i className="fas fa-camera"></i> New ID Card
                        </label>
                        <input
                          type="file"
                          name="idCard"
                          accept="image/*"
                          required
                          onChange={(e) => setIdCardFile(e.target.files?.[0])}
                        />
                      </div>
                      <button
                        type="submit"
                        className="auth-btn"
                        style={{ backgroundColor: "#e74c3c" }}
                      >
                        Re-Submit Application
                      </button>
                    </form>
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      backgroundColor: "#f4f6f8",
                      color: "#555",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      marginBottom: "15px",
                    }}
                  >
                    <h4>Status: {statusResult.idCardStatus}</h4>
                    <p>No ID card submitted yet.</p>
                  </div>
                )}

                <button
                  type="button"
                  className="auth-btn"
                  style={{ backgroundColor: "#7f8c8d", marginTop: "10px" }}
                  onClick={() => setStatusResult(null)}
                >
                  Check Another Account
                </button>
              </div>
            )}
          </div>
          <div
            className={`auth-form ${activeTab === "forgot" ? "active" : ""}`}
            id="forgot-form"
          >
            <form onSubmit={handleForgotPassword}>
              <div className="form-section-title">Reset Password</div>
              <p
                style={{
                  marginBottom: "15px",
                  color: "#555",
                  fontSize: "0.9rem",
                }}
              >
                Enter your campus email address and we'll send you a link to
                reset your password.
              </p>
              <div className="input-group">
                <label htmlFor="forgot-email">
                  <i className="fas fa-envelope"></i> Email
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button type="submit" className="auth-btn">
                Send Reset Link
              </button>
              <div className="auth-footer">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("login");
                  }}
                >
                  Back to Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
