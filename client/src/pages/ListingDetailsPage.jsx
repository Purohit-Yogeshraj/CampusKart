import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { request, SERVER_BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../utils/time";

function getImageSrc(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("/images/")) return imagePath;
  return `${SERVER_BASE_URL}${imagePath}`;
}

export function ListingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListingData();
  }, [id]);

  async function loadListingData() {
    try {
      setLoading(true);
      // Fetch the product details
      const { listing: data } = await request(`/listings/${id}`);
      setListing(data);

      // Fetch reviews that specifically belong to this product
      const { reviews: reviewData } = await request(
        `/reviews/user/${data.userId}`,
      );
      const specificReviews = reviewData.sellerReviews.filter(
        (r) => r.listing?._id === id || r.listing === id,
      );
      setReviews(specificReviews);
    } catch (error) {
      alert(error.message);
      navigate("/buy");
    } finally {
      setLoading(false);
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to leave a review.");
      return navigate("/auth");
    }
    try {
      const data = await request("/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId: listing.userId,
          listingId: listing.id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
          type: "seller",
        }),
      });
      alert(data.message);
      setReviewForm({ rating: 5, comment: "" });
      loadListingData(); // Reload to show the new review
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading product...
        </div>
        <Footer />
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          Product not found.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="page-container"
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}
      >
        {/* Product Details Section */}
        <div
          style={{
            display: "flex",
            gap: "30px",
            flexWrap: "wrap",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ flex: "1 1 400px" }}>
            {listing.imagePath ? (
              <img
                src={getImageSrc(listing.imagePath)}
                alt={listing.title}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "300px",
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  color: "#2b84ea",
                  fontSize: "4rem",
                }}
              >
                <i className="fas fa-tag"></i>
              </div>
            )}
          </div>

          <div
            style={{
              flex: "1 1 400px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <h1 style={{ margin: "0", color: "#2c3e50" }}>{listing.title}</h1>
            <h2 style={{ margin: "0", color: "#2b84ea" }}>
              Rs. {Number(listing.price).toFixed(2)}
            </h2>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#f0f4f8",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  color: "#52606d",
                  fontWeight: "500",
                }}
              >
                {listing.category}
              </span>
              <span
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#f0f4f8",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  color: "#52606d",
                  fontWeight: "500",
                }}
              >
                {listing.college}
              </span>
              <span
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#f0f4f8",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  color: "#52606d",
                  fontWeight: "500",
                }}
              >
                {listing.department}
              </span>
              <span
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#f0f4f8",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  color: "#52606d",
                  fontWeight: "500",
                }}
              >
                {listing.year}
              </span>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                marginTop: "10px",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px 0",
                  color: "#34495e",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                }}
              >
                Description
              </p>
              <p
                style={{
                  margin: "0",
                  color: "#555",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {listing.description}
              </p>
            </div>

            <div
              style={{
                marginTop: "auto",
                paddingTop: "20px",
                borderTop: "1px solid #eee",
              }}
            >
              <p
                style={{
                  color: "#7f8c8d",
                  fontSize: "0.95rem",
                  marginBottom: "15px",
                }}
              >
                Posted by{" "}
                <strong style={{ color: "#2c3e50" }}>
                  {listing.sellerName}
                </strong>{" "}
                • {timeAgo(listing.postedAt)}
              </p>
              {user?.id !== listing.userId && (
                <Link
                  to={`/dashboard?tab=messages&user=${listing.userId}&name=${encodeURIComponent(listing.sellerName || "Seller")}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                    background: "#2b84ea",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    transition: "background 0.2s",
                  }}
                >
                  <i className="fas fa-comment-dots"></i> Message Seller
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: "15px",
              margin: "0 0 25px 0",
              color: "#2c3e50",
            }}
          >
            Product Reviews
          </h3>

          {user && user.id !== listing.userId && (
            <form
              onSubmit={handleReviewSubmit}
              style={{
                marginBottom: "40px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #eee",
              }}
            >
              <h4
                style={{
                  margin: "0 0 20px 0",
                  color: "#2c3e50",
                  fontSize: "1.1rem",
                }}
              >
                Write a Review
              </h4>
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#555",
                    fontWeight: "500",
                  }}
                >
                  Rating
                </label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, rating: e.target.value })
                  }
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "1rem",
                  }}
                >
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>
                      {num} Stars
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#555",
                    fontWeight: "500",
                  }}
                >
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                  }}
                  placeholder="Share your experience about this product..."
                ></textarea>
              </div>
              <button
                type="submit"
                style={{
                  background: "#2b84ea",
                  color: "#fff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                  transition: "background 0.2s",
                }}
              >
                Submit Review
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#7f8c8d",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <i
                className="fas fa-comment-slash"
                style={{
                  fontSize: "2rem",
                  marginBottom: "10px",
                  color: "#bdc3c7",
                }}
              ></i>
              <p style={{ margin: 0 }}>
                No reviews for this product yet. Be the first to review!
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {reviews.map((review) => (
                <div
                  key={review._id}
                  style={{
                    padding: "20px",
                    border: "1px solid #eee",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "35px",
                          height: "35px",
                          backgroundColor: "#2b84ea",
                          color: "#fff",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {review.reviewer.username.charAt(0).toUpperCase()}
                      </div>
                      <strong style={{ color: "#2c3e50", fontSize: "1.05rem" }}>
                        {review.reviewer.username}
                      </strong>
                    </div>
                    <span style={{ color: "#f1c40f", fontSize: "0.9rem" }}>
                      {[...Array(review.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                    </span>
                  </div>
                  <p style={{ margin: "0", color: "#444", lineHeight: "1.5" }}>
                    {review.comment}
                  </p>
                  <small
                    style={{
                      color: "#95a5a6",
                      display: "block",
                      marginTop: "12px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <i
                      className="far fa-clock"
                      style={{ marginRight: "5px" }}
                    ></i>
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
