import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { request } from "../utils/api";
import { fetchColleges } from "../utils/colleges";

const categories = [
  "Textbooks",
  "Notes",
  "Lab Coats",
  "Electronics",
  "Drafters",
  "Stationery",
  "Accessories",
  "Other",
];

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "All Years"];

const departments = [
  "BCA",
  "MCA",
  "B.Sc",
  "M.Sc",
  "B.A",
  "M.A",
  "B.Com",
  "M.Com",
  "Engineering",
  "All Courses",
];

const initialFormState = {
  title: "",
  category: "",
  price: "",
  phone: "",
  college: "",
  year: "All Years",
  department: "All Courses",
  description: "",
};

export function SellPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialFormState);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [colleges, setColleges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchColleges()
      .then(setColleges)
      .catch((error) => console.error("Failed to load colleges", error));
  }, []);

  const defaultCollege = useMemo(
    () => user?.college || colleges[0]?.name || "",
    [user?.college, colleges],
  );

  useEffect(() => {
    if (defaultCollege) {
      setForm((current) => ({
        ...current,
        college: current.college || defaultCollege,
      }));
    }
  }, [defaultCollege]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (image) {
      payload.append("image", image);
    }

    try {
      const data = await request("/listings", {
        method: "POST",
        body: payload,
      });
      alert(data.message);
      navigate("/dashboard?tab=listings");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <>
      <Navbar active="sell" />
      <div className="page-container">
        <div className="sell-form">
          <h2 className="form-header">Post a New Item</h2>
          <form id="post-ad-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <i className="fas fa-tag"></i> Item Title
              </label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g. BCA Semester 3 Java Book"
                required
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-list"></i> Category
              </label>
              <select
                name="category"
                className="form-control"
                required
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-dollar-sign"></i> Price (Rs.)
              </label>
              <input
                type="number"
                name="price"
                className="form-control"
                placeholder="e.g. 500"
                min="1"
                required
                value={form.price}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-phone"></i> Your Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={user?.contact || ""}
                readOnly
                style={{
                  backgroundColor: "#f0f4f8",
                  cursor: "not-allowed",
                  color: "#6b7785",
                }}
              />
              <small style={{ color: "#7f8c8d" }}>
                Your phone number stays private on public listings. Buyers see
                only in-app chat first.
              </small>
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-building"></i> College
              </label>
              <input
                type="text"
                name="college"
                className="form-control"
                value={user?.college || ""}
                readOnly
                style={{
                  backgroundColor: "#f0f4f8",
                  cursor: "not-allowed",
                  color: "#6b7785",
                }}
              />
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-graduation-cap"></i> Target Year
              </label>
              <select
                name="year"
                className="form-control"
                required
                value={form.year}
                onChange={handleChange}
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-book"></i> Targeted Course
              </label>
              <select
                name="department"
                className="form-control"
                required
                value={form.department}
                onChange={handleChange}
              >
                {departments.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-comment"></i> Description
              </label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                placeholder="Describe condition, subject, author, edition, or reason for selling"
                required
                value={form.description}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-image"></i> Item Photo (Optional)
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
              />
              <div
                id="image-preview"
                style={{
                  marginTop: "10px",
                  display: preview ? "block" : "none",
                }}
              >
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
            <button type="submit" className="btn-submit">
              Post Ad
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
