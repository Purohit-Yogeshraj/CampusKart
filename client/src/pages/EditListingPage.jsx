import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { request, SERVER_BASE_URL } from "../utils/api";
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

export function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    fetchColleges()
      .then(setColleges)
      .catch((error) => console.error("Failed to load colleges", error));

    request(`/listings/${id}`)
      .then((data) => {
        setForm({
          title: data.listing.title,
          category: data.listing.category,
          price: data.listing.price,
          phone: data.listing.phone,
          college: data.listing.college,
          year: data.listing.year,
          department: data.listing.department || "All Courses",
          description: data.listing.description,
          imagePath: data.listing.imagePath,
        });
      })
      .catch((error) => {
        alert(error.message);
        navigate("/sell");
      });
  }, [id, navigate]);

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
    payload.append("title", form.title);
    payload.append("category", form.category);
    payload.append("price", form.price);
    payload.append("phone", form.phone);
    payload.append("college", form.college);
    payload.append("year", form.year);
    payload.append("department", form.department);
    payload.append("description", form.description);
    if (image) {
      payload.append("image", image);
    }

    try {
      const data = await request(`/listings/${id}`, {
        method: "PUT",
        body: payload,
      });
      alert(data.message);
      navigate("/sell");
    } catch (error) {
      alert(error.message);
    }
  }

  if (!form) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
    );
  }

  return (
    <>
      <Navbar active="sell" />
      <div className="page-container">
        <div className="sell-form">
          <h2 className="form-header">Edit Your Ad</h2>
          <form id="edit-ad-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <i className="fas fa-tag"></i> Item Title
              </label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-list"></i> Category
              </label>
              <select
                name="category"
                className="form-control"
                value={form.category}
                onChange={handleChange}
                required
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
                value={form.price}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-phone"></i> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                required
              />
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-building"></i> College
              </label>
              <select
                name="college"
                className="form-control"
                value={form.college}
                onChange={handleChange}
                required
              >
                {colleges.map((option) => (
                  <option key={option.slug} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-graduation-cap"></i> Target Year
              </label>
              <select
                name="year"
                className="form-control"
                value={form.year}
                onChange={handleChange}
                required
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
                value={form.department}
                onChange={handleChange}
                required
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
                value={form.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-image"></i> Current Image
              </label>
              {form.imagePath || preview ? (
                <img
                  src={
                    preview ||
                    (form.imagePath.startsWith("/images/")
                      ? form.imagePath
                      : `${SERVER_BASE_URL}${form.imagePath}`)
                  }
                  alt="Current"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "8px",
                    margin: "10px 0",
                  }}
                />
              ) : (
                <div style={{ color: "#7f8c8d", margin: "10px 0" }}>
                  No image uploaded
                </div>
              )}
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
              />
            </div>
            <button type="submit" className="btn-submit">
              Update Ad
            </button>
            <Link
              to="/sell"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "15px",
                color: "#2b84ea",
              }}
            >
              Back to My Ads
            </Link>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
