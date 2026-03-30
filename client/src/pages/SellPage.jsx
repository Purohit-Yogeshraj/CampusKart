import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import { ListingCard } from "../components/ListingCard";
import { Navbar } from "../components/Navbar";
import { request } from "../utils/api";

const initialFormState = {
  title: "",
  category: "",
  price: "",
  phone: "",
  location: "",
  description: "",
};

export function SellPage() {
  const [form, setForm] = useState(initialFormState);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [myListings, setMyListings] = useState([]);
  const navigate = useNavigate();

  async function loadMyListings() {
    const data = await request("/listings/mine");
    setMyListings(data.listings);
  }

  useEffect(() => {
    loadMyListings().catch((error) => {
      alert(error.message);
    });
  }, []);

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
    const formElement = event.currentTarget;

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
      setForm(initialFormState);
      setImage(null);
      setPreview("");
      formElement.reset();
      await loadMyListings();
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleDelete(id) {
    const shouldDelete = window.confirm("Are you sure you want to delete this ad?");
    if (!shouldDelete) {
      return;
    }

    try {
      const data = await request(`/listings/${id}`, {
        method: "DELETE",
      });
      alert(data.message);
      await loadMyListings();
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
              <label><i className="fas fa-tag"></i> Item Title</label>
              <input type="text" name="title" className="form-control" placeholder="e.g. Physics Textbook" required value={form.title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label><i className="fas fa-list"></i> Category</label>
              <select name="category" className="form-control" required value={form.category} onChange={handleChange}>
                <option value="">Select Category</option>
                <option value="Books">Books</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="form-group">
              <label><i className="fas fa-dollar-sign"></i> Price (₹)</label>
              <input type="number" name="price" className="form-control" placeholder="e.g. 500" min="1" required value={form.price} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label><i className="fas fa-phone"></i> Your Phone Number</label>
              <input type="tel" name="phone" className="form-control" placeholder="e.g. 9876543210" pattern="[0-9]{10}" required value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label><i className="fas fa-map-marker-alt"></i> Location</label>
              <input type="text" name="location" className="form-control" placeholder="e.g. Hostel A, Block 3" required value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label><i className="fas fa-comment"></i> Description</label>
              <textarea name="description" className="form-control" rows="4" placeholder="Describe condition, reason for selling, etc." required value={form.description} onChange={handleChange}></textarea>
            </div>
            <div className="form-group">
              <label><i className="fas fa-image"></i> Item Photo (Optional)</label>
              <input type="file" className="form-control" accept="image/jpeg,image/png" onChange={handleImageChange} />
              <div id="image-preview" style={{ marginTop: "10px", display: preview ? "block" : "none" }}>
                <img src={preview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }} />
              </div>
            </div>
            <button type="submit" className="btn-submit">Post Ad</button>
          </form>
        </div>

        <div className="my-ads-section" style={{ marginTop: "40px" }}>
          <h2 className="my-ads-header" style={{ textAlign: "center", marginBottom: "20px", color: "#2c3e50" }}>
            Your Posted Ads
          </h2>
          {myListings.length > 0 ? (
            <div className="my-listings-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" }}>
              {myListings.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  editable
                  onEdit={(listingId) => navigate(`/edit/${listingId}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#7f8c8d" }}>You haven't posted any ads yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
