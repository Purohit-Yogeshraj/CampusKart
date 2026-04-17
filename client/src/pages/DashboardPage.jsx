import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChatComponent } from "../components/ChatComponent";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { API_BASE_URL, request } from "../utils/api";
import "../dashboard.css";

function extractReviewTarget(messages, currentUserId) {
  const linkedMessage = [...messages]
    .reverse()
    .find((message) => message.listing?.user?._id);
  if (!linkedMessage) {
    return null;
  }

  const sellerId = linkedMessage.listing.user._id;
  if (sellerId === currentUserId || linkedMessage.listing.status !== "sold") {
    return null;
  }

  return {
    listingId: linkedMessage.listing._id || linkedMessage.listing,
    listingTitle: linkedMessage.listing.title,
    revieweeId: sellerId,
    sellerName: linkedMessage.listing.user.username,
  };
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile",
  );
  const [profile, setProfile] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const nextTab = searchParams.get("tab") || "profile";
    setActiveTab(nextTab);
    const nextUser = searchParams.get("user");
    if (nextUser) {
      setSelectedConversationId(nextUser);
      setActiveTab("messages");
    }
  }, [searchParams]);

  const fetchProfileData = useCallback(async () => {
    try {
      const data = await request("/dashboard/profile");
      setProfile(data.profile);
      setReviews(data.profile.recentReviews || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  const fetchUserListings = useCallback(async () => {
    try {
      const data = await request("/dashboard/my-listings");
      setMyListings(data.listings || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      const data = await request("/wishlist");
      setWishlistItems(data.wishlist?.items || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await request("/chat/conversations");
      const nextConversations = data.conversations || [];
      setConversations(nextConversations);
      if (!selectedConversationId && nextConversations.length) {
        setSelectedConversationId(nextConversations[0].conversationWith);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    Promise.all([
      fetchProfileData(),
      fetchUserListings(),
      fetchWishlist(),
      fetchConversations(),
    ]).finally(() => setIsLoading(false));
  }, [
    user,
    navigate,
    fetchProfileData,
    fetchUserListings,
    fetchWishlist,
    fetchConversations,
  ]);

  const handleUpdateStatus = async (listingId, newStatus) => {
    try {
      const data = await request(`/dashboard/listing/status/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (data.success) {
        fetchUserListings();
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRemoveFromWishlist = async (listingId, e) => {
    e.stopPropagation(); // Prevents the card's onClick (redirect) from firing
    try {
      const data = await request(`/wishlist/remove/${listingId}`, {
        method: "DELETE",
      });
      if (data.success) {
        fetchWishlist();
        alert(data.message || "Removed from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert(error.message);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUploadIdCard = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("idCard", file);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/upload-id-card`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload ID card");
      }
      alert(data.message);
      await fetchProfileData();
    } catch (error) {
      alert(error.message);
    } finally {
      event.target.value = "";
    }
  };

  const handleShareContact = async () => {
    if (!selectedConversationId) {
      return;
    }

    const recipientUsername =
      conversations.find((c) => c.conversationWith === selectedConversationId)
        ?.user?.username || "this user";

    if (
      window.confirm(
        `Are you sure you want to share your email and phone number with ${recipientUsername}? This cannot be undone.`,
      )
    ) {
      try {
        const data = await request("/dashboard/share-contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: selectedConversationId }),
        });
        // The new message will appear automatically via the socket connection.
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const reviewTarget = useMemo(
    () => extractReviewTarget(selectedMessages, user?.id),
    [selectedMessages, user?.id],
  );

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!reviewTarget) {
      return;
    }

    try {
      const data = await request("/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId: reviewTarget.revieweeId,
          listingId: reviewTarget.listingId,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
          type: "seller",
        }),
      });
      alert(data.message);
      setReviewForm({ rating: 5, comment: "" });
      fetchProfileData();
    } catch (error) {
      alert(error.message);
    }
  };

  const displayConversations = useMemo(() => {
    if (!selectedConversationId) return conversations;
    const exists = conversations.find(
      (c) => c.conversationWith === selectedConversationId,
    );
    if (exists) return conversations;

    const sellerName = searchParams.get("name") || "New Conversation";

    return [
      {
        conversationWith: selectedConversationId,
        user: { username: sellerName },
        lastMessage: "Start typing a message...",
      },
      ...conversations,
    ];
  }, [conversations, selectedConversationId, searchParams]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-loading">Loading...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container" style={{ minHeight: "85vh" }}>
        <div className="dashboard-wrapper">
          <div className="dashboard-sidebar">
            <button
              className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => switchTab("profile")}
            >
              <i className="fas fa-user"></i> My Profile
            </button>
            <button
              className={`tab-btn ${activeTab === "listings" ? "active" : ""}`}
              onClick={() => switchTab("listings")}
            >
              <i className="fas fa-list"></i> My Listings ({myListings.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "wishlist" ? "active" : ""}`}
              onClick={() => switchTab("wishlist")}
            >
              <i className="fas fa-heart"></i> Wishlist ({wishlistItems.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
              onClick={() => switchTab("messages")}
            >
              <i className="fas fa-envelope"></i> Messages (
              {conversations.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => switchTab("reviews")}
            >
              <i className="fas fa-star"></i> Reviews ({reviews.length})
            </button>
          </div>

          <div className="dashboard-content" style={{ minHeight: "80vh" }}>
            {activeTab === "profile" && profile && (
              <div className="profile-section">
                <h2>My Profile</h2>
                <div className="profile-grid">
                  <div className="profile-card">
                    <h3>Personal Information</h3>
                    <div className="info-row">
                      <span className="label">Name:</span>
                      <span className="value">{profile.username}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Email:</span>
                      <span className="value">{profile.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Phone:</span>
                      <span className="value">{profile.contact}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Gender:</span>
                      <span className="value">{profile.gender}</span>
                    </div>
                  </div>

                  <div className="profile-card">
                    <h3>Academic Details</h3>
                    <div className="info-row">
                      <span className="label">Enrollment No:</span>
                      <span className="value">
                        {profile.enrollmentNo || "N/A"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">College:</span>
                      <span className="value">{profile.college}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Department:</span>
                      <span className="value">{profile.department}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Semester:</span>
                      <span className="value">{profile.semester}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Passing Year:</span>
                      <span className="value">
                        {profile.passingYear || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="profile-card">
                    <h3>Verification Status</h3>
                    <div className="info-row">
                      <span className="label">ID Card:</span>
                      <span className={`value status-${profile.idCardStatus}`}>
                        {profile.idCardStatus === "verified" && (
                          <>
                            <i className="fas fa-check-circle"></i> Verified
                          </>
                        )}
                        {profile.idCardStatus === "pending" && (
                          <>
                            <i className="fas fa-hourglass-half"></i> Pending
                          </>
                        )}
                        {profile.idCardStatus === "not-submitted" && (
                          <>
                            <i className="fas fa-exclamation-circle"></i> Not
                            Submitted
                          </>
                        )}
                        {profile.idCardStatus === "rejected" && (
                          <>
                            <i className="fas fa-times-circle"></i> Rejected
                          </>
                        )}
                      </span>
                    </div>
                    {!profile.isVerified &&
                      profile.idCardStatus !== "pending" && (
                        <label className="verify-btn">
                          Upload ID Card
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleUploadIdCard}
                            style={{ display: "none" }}
                          />
                        </label>
                      )}
                  </div>

                  <div className="profile-card">
                    <h3>Rating and Statistics</h3>
                    <div className="info-row">
                      <span className="label">Rating:</span>
                      <span className="value rating">
                        <i className="fas fa-star"></i> {profile.rating} (
                        {profile.ratingCount})
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Active Listings:</span>
                      <span className="value">
                        {profile.stats.activeListing}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Sold Items:</span>
                      <span className="value">
                        {profile.stats.soldListings}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "listings" && (
              <div className="listings-section">
                <h2>My Listings</h2>
                {myListings.length === 0 ? (
                  <div className="empty-state">
                    <p>No listings yet</p>
                    <a href="/sell" className="btn btn-primary">
                      Create Your First Listing
                    </a>
                  </div>
                ) : (
                  <div className="listings-grid">
                    {myListings.map((listing) => (
                      <div
                        key={listing._id || listing.id}
                        className="listing-card"
                      >
                        {listing.imagePath && (
                          <img
                            src={
                              listing.imagePath.startsWith("/images/")
                                ? listing.imagePath
                                : `${API_BASE_URL.replace(/\/api$/, "")}${listing.imagePath}`
                            }
                            alt={listing.title}
                          />
                        )}
                        <div className="listing-content">
                          <h4>{listing.title}</h4>
                          <p className="category">
                            <i className="fas fa-tag"></i> {listing.category}
                          </p>
                          <p className="price">Rs. {listing.price}</p>
                          <div className="listing-meta">
                            <span className={`status ${listing.status}`}>
                              {listing.status}
                            </span>
                            <span className="location">
                              <i className="fas fa-map-marker-alt"></i>{" "}
                              {listing.college}
                            </span>
                          </div>
                          <div className="listing-actions">
                            {listing.status === "active" && (
                              <>
                                <button
                                  type="button"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    backgroundColor: "#2b84ea",
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    marginRight: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                  }}
                                  onClick={() =>
                                    navigate(
                                      `/edit/${listing._id || listing.id}`,
                                    )
                                  }
                                >
                                  <i className="fas fa-edit"></i> Update
                                </button>
                                <button
                                  type="button"
                                  className="btn-small sold"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      listing._id || listing.id,
                                      "sold",
                                    )
                                  }
                                >
                                  <i className="fas fa-check"></i> Mark Sold
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="listings-section">
                <h2>Saved For Later</h2>
                {wishlistItems.length === 0 ? (
                  <div className="empty-state">
                    <p>Your wishlist is empty right now.</p>
                  </div>
                ) : (
                  <div className="listings-grid">
                    {wishlistItems.map((entry) => {
                      const listing = entry.listing;
                      if (!listing) return null;

                      return (
                        <div
                          key={entry._id || listing._id}
                          className="listing-card"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate(`/listing/${listing._id || listing.id}`)
                          }
                        >
                          {listing.imagePath && (
                            <img
                              src={
                                listing.imagePath.startsWith("/images/")
                                  ? listing.imagePath
                                  : `${API_BASE_URL.replace(/\/api$/, "")}${listing.imagePath}`
                              }
                              alt={listing.title}
                            />
                          )}
                          <div className="listing-content">
                            <h4>{listing.title}</h4>
                            <p className="category">
                              <i className="fas fa-tag"></i> {listing.category}
                            </p>
                            <p className="price">Rs. {listing.price}</p>
                            <div className="listing-meta">
                              <span className="location">
                                <i className="fas fa-map-marker-alt"></i>{" "}
                                {listing.college}
                              </span>
                            </div>
                            <div className="listing-actions">
                              <button
                                type="button"
                                className="btn-small danger"
                                onClick={(e) =>
                                  handleRemoveFromWishlist(
                                    listing._id || listing.id,
                                    e,
                                  )
                                }
                                style={{
                                  backgroundColor: "#e74c3c",
                                  color: "#fff",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                }}
                              >
                                <i className="fas fa-trash"></i> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <div className="messages-section">
                <h2>Messages</h2>
                {displayConversations.length === 0 ? (
                  <div className="empty-state">
                    <p>
                      No conversations yet. Start by messaging a seller from a
                      listing.
                    </p>
                  </div>
                ) : (
                  <div className="messages-layout">
                    <div className="conversation-list">
                      {displayConversations.map((conversation) => (
                        <button
                          key={conversation.conversationWith}
                          type="button"
                          className={`conversation-item ${selectedConversationId === conversation.conversationWith ? "active" : ""}`}
                          onClick={() =>
                            setSelectedConversationId(
                              conversation.conversationWith,
                            )
                          }
                        >
                          <strong>
                            {conversation.user?.username || "Student"}
                          </strong>
                          <span>{conversation.lastMessage}</span>
                        </button>
                      ))}
                    </div>
                    <div className="chat-panel">
                      {selectedConversationId ? (
                        <>
                          <div
                            className="chat-actions-bar"
                            style={{
                              padding: "10px",
                              borderBottom: "1px solid #eee",
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              type="button"
                              onClick={handleShareContact}
                              title="Share your contact info with this user"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "#f39c12",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              <i className="fas fa-id-card"></i> Reveal Contact
                            </button>
                          </div>
                          <ChatComponent
                            currentUserId={user.id}
                            otherUserId={selectedConversationId}
                            onMessagesChange={setSelectedMessages}
                          />
                          {reviewTarget && (
                            <form
                              className="review-form-card"
                              onSubmit={handleReviewSubmit}
                            >
                              <h3>Rate Seller</h3>
                              <p>
                                Deal completed for{" "}
                                <strong>{reviewTarget.listingTitle}</strong>.
                                Share feedback for {reviewTarget.sellerName}.
                              </p>
                              <div className="review-form-row">
                                <label htmlFor="rating">Rating</label>
                                <select
                                  id="rating"
                                  value={reviewForm.rating}
                                  onChange={(event) =>
                                    setReviewForm((current) => ({
                                      ...current,
                                      rating: event.target.value,
                                    }))
                                  }
                                >
                                  {[5, 4, 3, 2, 1].map((value) => (
                                    <option key={value} value={value}>
                                      {value} Star
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="review-form-row">
                                <label htmlFor="comment">Comment</label>
                                <textarea
                                  id="comment"
                                  rows="3"
                                  value={reviewForm.comment}
                                  onChange={(event) =>
                                    setReviewForm((current) => ({
                                      ...current,
                                      comment: event.target.value,
                                    }))
                                  }
                                  placeholder="How was the seller and item condition?"
                                />
                              </div>
                              <button type="submit" className="btn btn-primary">
                                Submit Review
                              </button>
                            </form>
                          )}
                        </>
                      ) : (
                        <div className="empty-state">
                          <p>Select a conversation to start chatting.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="reviews-section">
                <h2>Recent Reviews</h2>
                {reviews.length === 0 ? (
                  <div className="empty-state">
                    <p>No reviews yet</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review._id} className="review-card">
                        <div className="review-header">
                          <span className="reviewer-name">
                            {review.reviewer.username}
                          </span>
                          <span className="review-rating">
                            {[...Array(review.rating)].map((_, i) => (
                              <i key={i} className="fas fa-star"></i>
                            ))}
                          </span>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
