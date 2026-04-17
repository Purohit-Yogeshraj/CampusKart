import { useCallback, useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SERVER_BASE_URL, request } from "../utils/api";
import "../dashboard.css";

export function AdminPage() {
  const [stats, setStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [listings, setListings] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [collegeName, setCollegeName] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    try {
      setErrorMessage("");
      const results = await Promise.allSettled([
        request(`/admin/stats?t=${Date.now()}`),
        request(`/admin/pending-verifications?t=${Date.now()}`),
        request(`/admin/all-listings?t=${Date.now()}`),
        request(`/admin/colleges?t=${Date.now()}`),
      ]);

      if (results[0].status === "fulfilled") setStats(results[0].value.stats);
      if (results[1].status === "fulfilled")
        setPendingVerifications(results[1].value.users || []);
      if (results[2].status === "fulfilled")
        setListings(results[2].value.listings || []);
      if (results[3].status === "fulfilled")
        setColleges(results[3].value.colleges || []);

      const errors = results
        .filter((r) => r.status === "rejected")
        .map((r) => r.reason.message);
      if (errors.length > 0) {
        setErrorMessage("Some system data was blocked: " + errors.join(", "));
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  async function handleVerifyStudent(studentId, isApproved) {
    const rejectionReason = !isApproved
      ? window.prompt("Enter rejection reason") ||
        "Verification details did not match"
      : "";

    try {
      const data = await request(`/admin/verify-student/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved, rejectionReason }),
      });
      alert(data.message);
      await loadAdminData();
    } catch (error) {
      setErrorMessage(error.message || "Failed to verify student.");
    }
  }

  async function handleModerationDelete(listingId) {
    const reason = window.prompt(
      "Why are you removing this listing?",
      "Fake or invalid listing",
    );
    if (!reason) {
      return;
    }

    try {
      const data = await request(`/admin/listing/${listingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      alert(data.message);
      await loadAdminData();
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove listing.");
    }
  }

  async function handleAddCollege(event) {
    event.preventDefault();
    if (!collegeName.trim()) {
      return;
    }

    try {
      const data = await request("/admin/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: collegeName.trim() }),
      });
      setErrorMessage("");
      setCollegeName("");
      await loadAdminData();
      alert(data.message);
    } catch (error) {
      setErrorMessage(error.message || "Failed to add college.");
    }
  }

  async function handleRemoveCollege(collegeId) {
    const shouldRemove = window.confirm(
      "Remove this college from admin-managed college list?",
    );
    if (!shouldRemove) {
      return;
    }

    try {
      const data = await request(`/admin/colleges/${collegeId}`, {
        method: "DELETE",
      });
      setErrorMessage("");
      await loadAdminData();
      alert(data.message);
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove college.");
    }
  }

  async function handleExportVerifiedUsers() {
    try {
      const data = await request(`/admin/verified-users?t=${Date.now()}`);
      const users = data.users || [];

      if (users.length === 0) {
        return alert("No verified users to export.");
      }

      const headers = [
        "Name",
        "Email",
        "Contact",
        "Gender",
        "DOB",
        "SPID",
        "College",
        "Department",
        "Semester",
        "Passing Year",
      ];
      const csvRows = [
        headers.join(","),
        ...users.map((u) =>
          [
            `"${u.username || ""}"`,
            `"${u.email || ""}"`,
            `"${u.contact || ""}"`,
            `"${u.gender || ""}"`,
            `"${u.dob ? new Date(u.dob).toLocaleDateString() : ""}"`,
            `"${u.enrollmentNo || ""}"`,
            `"${u.college || ""}"`,
            `"${u.department || ""}"`,
            `"${u.semester || ""}"`,
            `"${u.passingYear || ""}"`,
          ].join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "verified_students_report.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error.message || "Failed to export verified users.");
    }
  }

  if (loading) {
    return (
      <>
        <Navbar active="admin" />
        <div className="dashboard-loading">Loading admin panel...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar active="admin" />
      <div className="dashboard-container">
        <div
          className="dashboard-wrapper"
          style={{ gridTemplateColumns: "1fr" }}
        >
          <div className="dashboard-content">
            <div className="admin-section">
              <div>
                <h2>Admin Panel</h2>
                <p style={{ color: "#6b7785", marginTop: "-14px" }}>
                  Verify students, manage affiliated colleges, and remove
                  invalid listings from the marketplace.
                </p>
              </div>

              {errorMessage && (
                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "#fef0f0",
                    color: "#e74c3c",
                    border: "1px solid #e74c3c",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    fontWeight: "bold",
                  }}
                >
                  <i className="fas fa-exclamation-triangle"></i> {errorMessage}
                </div>
              )}

              {stats && (
                <div className="admin-stats-grid">
                  <div
                    className="admin-stat-card"
                    onClick={handleExportVerifiedUsers}
                    style={{ cursor: "pointer" }}
                    title="Click to download CSV report"
                  >
                    <strong>{stats.verifiedUsers}</strong>
                    <span>
                      Verified Students{" "}
                      <i
                        className="fas fa-download"
                        style={{ marginLeft: "5px", color: "#2b84ea" }}
                      ></i>
                    </span>
                  </div>
                  <div className="admin-stat-card">
                    <strong>{stats.pendingVerifications}</strong>
                    <span>Pending IDs</span>
                  </div>
                  <div className="admin-stat-card">
                    <strong>{stats.activeListing}</strong>
                    <span>Active Listings</span>
                  </div>
                </div>
              )}

              <div className="admin-panel-grid">
                <div className="admin-panel-card">
                  <h3>Student Verification Queue</h3>
                  {pendingVerifications.length === 0 ? (
                    <p>No pending verifications.</p>
                  ) : (
                    pendingVerifications.map((student) => (
                      <div
                        key={student._id}
                        className="admin-row-card"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "15px",
                          padding: "20px",
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                          border: "1px solid #eaeaea",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "15px",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: "250px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "15px",
                              }}
                            >
                              <div
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  borderRadius: "50%",
                                  backgroundColor: "#2b84ea",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  fontSize: "20px",
                                }}
                              >
                                {student.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4
                                  style={{
                                    margin: 0,
                                    color: "#333",
                                    fontSize: "16px",
                                  }}
                                >
                                  {student.username}
                                </h4>
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#6b7785",
                                    backgroundColor: "#f0f4f8",
                                    padding: "3px 8px",
                                    borderRadius: "12px",
                                    display: "inline-block",
                                    marginTop: "4px",
                                  }}
                                >
                                  {student.department} • Semester{" "}
                                  {student.semester}
                                </span>
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#555",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              <div>
                                <i
                                  className="fas fa-id-badge"
                                  style={{ width: "20px", color: "#888" }}
                                ></i>{" "}
                                <strong>SPID:</strong> {student.enrollmentNo}
                              </div>
                              <div>
                                <i
                                  className="fas fa-university"
                                  style={{ width: "20px", color: "#888" }}
                                ></i>{" "}
                                {student.college}
                              </div>
                              <div>
                                <i
                                  className="fas fa-envelope"
                                  style={{ width: "20px", color: "#888" }}
                                ></i>{" "}
                                <a
                                  href={`mailto:${student.email}`}
                                  style={{
                                    color: "#2b84ea",
                                    textDecoration: "none",
                                  }}
                                >
                                  {student.email}
                                </a>
                              </div>
                              {student.contact && (
                                <div>
                                  <i
                                    className="fas fa-phone"
                                    style={{ width: "20px", color: "#888" }}
                                  ></i>{" "}
                                  {student.contact}
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              flex: 1,
                              minWidth: "200px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "15px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "8px",
                              border: "1px dashed #ccc",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#666",
                                marginBottom: "10px",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              ID Card Document
                            </span>
                            {student.idCardPath ? (
                              <a
                                href={`${SERVER_BASE_URL}${student.idCardPath}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "10px 20px",
                                  backgroundColor: "#fff",
                                  border: "1px solid #d2dfef",
                                  borderRadius: "6px",
                                  color: "#2b84ea",
                                  textDecoration: "none",
                                  fontWeight: "600",
                                  transition: "all 0.2s",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                }}
                              >
                                <i className="fas fa-external-link-alt"></i>{" "}
                                View ID Card
                              </a>
                            ) : (
                              <span
                                style={{
                                  color: "#e74c3c",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                }}
                              >
                                <i className="fas fa-times-circle"></i> No
                                Document Provided
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "5px",
                            paddingTop: "15px",
                            borderTop: "1px solid #eee",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleVerifyStudent(student._id, true)
                            }
                            style={{
                              flex: 1,
                              padding: "12px",
                              backgroundColor: "#27ae60",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              fontSize: "14px",
                              transition: "background-color 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#219653")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#27ae60")
                            }
                          >
                            <i className="fas fa-check-circle"></i> Approve
                            Access
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleVerifyStudent(student._id, false)
                            }
                            style={{
                              flex: 1,
                              padding: "12px",
                              backgroundColor: "#fff",
                              color: "#e74c3c",
                              border: "1px solid #e74c3c",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              fontSize: "14px",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#fef0f0";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                            }}
                          >
                            <i className="fas fa-times-circle"></i> Reject
                            Application
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="admin-panel-card">
                  <h3>Affiliated Colleges</h3>
                  <form
                    onSubmit={handleAddCollege}
                    className="review-form-card"
                    style={{ marginTop: 0 }}
                  >
                    <div className="review-form-row">
                      <label htmlFor="college-name">Add College</label>
                      <input
                        id="college-name"
                        value={collegeName}
                        onChange={(event) => setCollegeName(event.target.value)}
                        placeholder="e.g. SDJ INTERNATIONAL COLLEGE"
                        style={{
                          border: "1px solid #d2dfef",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          font: "inherit",
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ marginTop: "12px" }}
                    >
                      Add College
                    </button>
                  </form>
                </div>

                <div className="admin-panel-card">
                  <h3>Manage Colleges</h3>
                  {colleges.length === 0 ? (
                    <p>No colleges added yet.</p>
                  ) : (
                    <div style={{ marginTop: "14px" }}>
                      {colleges.map((college) => (
                        <div key={college._id} className="admin-row-card">
                          <div>
                            <strong>{college.name}</strong>
                            <p>
                              Status: {college.active ? "Active" : "Hidden"}
                            </p>
                          </div>
                          <div className="admin-actions-row">
                            <button
                              type="button"
                              className="btn-small danger"
                              onClick={() => handleRemoveCollege(college._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-panel-card">
                <h3>Marketplace Moderation</h3>
                {listings.length === 0 ? (
                  <p>No listings to moderate.</p>
                ) : (
                  listings.map((listing) => (
                    <div key={listing._id} className="admin-row-card">
                      <div>
                        <strong>{listing.title}</strong>
                        <p>
                          {listing.category} | Rs. {listing.price}
                        </p>
                        <p>
                          {listing.college} | {listing.location}
                        </p>
                        <p>Seller: {listing.user?.username || "Unknown"}</p>
                      </div>
                      <div className="admin-actions-row">
                        <button
                          type="button"
                          className="btn-small danger"
                          onClick={() => handleModerationDelete(listing._id)}
                        >
                          Remove Listing
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
