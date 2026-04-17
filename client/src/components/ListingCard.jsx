import { SERVER_BASE_URL } from "../utils/api";
import { Link } from "react-router-dom";
import { timeAgo } from "../utils/time";
import { WishlistHeart } from "./WishlistHeart";
import { useAuth } from "../context/AuthContext";

function getCategoryIcon(category) {
  const icons = {
    Textbooks: "fa-book",
    Notes: "fa-note-sticky",
    "Lab Coats": "fa-shirt",
    Electronics: "fa-laptop",
    Drafters: "fa-pen-ruler",
    Stationery: "fa-pencil",
    Accessories: "fa-briefcase",
    Other: "fa-box",
  };

  return icons[category] || "fa-tag";
}

function getImageSrc(imagePath) {
  if (!imagePath) {
    return "";
  }

  if (imagePath.startsWith("/images/")) {
    return imagePath;
  }

  return `${SERVER_BASE_URL}${imagePath}`;
}

function getImageStyle(imagePath, editable = false) {
  const isContainedImage = imagePath?.startsWith("/images/");

  return {
    width: "100%",
    height: "150px",
    objectFit: isContainedImage ? "contain" : "cover",
    background: isContainedImage ? "#f8f9fa" : "transparent",
    padding: isContainedImage ? "10px" : "0",
    borderRadius: editable ? "8px" : "0",
    marginBottom: editable ? "10px" : "0",
  };
}

export function ListingCard({
  item,
  editable = false,
  onEdit,
  onDelete,
  adminMode = false,
  onAdminRemove,
}) {
  const { user } = useAuth();

  if (editable) {
    return (
      <div className="my-ad-card">
        {item.imagePath ? (
          <img
            src={getImageSrc(item.imagePath)}
            alt={item.title}
            style={getImageStyle(item.imagePath, true)}
          />
        ) : (
          <div
            style={{
              background: "#f1f1f1",
              height: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              marginBottom: "10px",
              color: "#777",
            }}
          >
            No Image
          </div>
        )}
        <div>
          <strong>{item.title}</strong>
        </div>
        <div>
          Rs. {Number(item.price).toFixed(2)} | {item.category}
        </div>
        <div>
          {item.college} | {item.department} | {item.year}
        </div>
        <div>{item.phone}</div>
        <div className="ad-actions">
          <button
            className="ad-btn edit-btn"
            type="button"
            onClick={() => onEdit(item.id)}
          >
            <i className="fas fa-pen"></i> Edit
          </button>
          <button
            className="ad-btn delete-btn"
            type="button"
            onClick={() => onDelete(item.id)}
          >
            <i className="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listing-card" style={{ position: "relative" }}>
      <div
        style={{ position: "absolute", right: "12px", top: "12px", zIndex: 2 }}
      >
        <WishlistHeart listingId={item.id} />
      </div>
      <div className="listing-img">
        <Link
          to={`/listing/${item.id}`}
          style={{ display: "block", color: "inherit", textDecoration: "none" }}
        >
          {item.imagePath ? (
            <img
              src={getImageSrc(item.imagePath)}
              alt={item.title}
              style={getImageStyle(item.imagePath)}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "150px",
                color: "#2b84ea",
                fontSize: "2rem",
              }}
            >
              <i className={`fas ${getCategoryIcon(item.category)}`}></i>
            </div>
          )}
        </Link>
      </div>
      <div className="listing-body">
        <Link
          to={`/listing/${item.id}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <div className="listing-title" style={{ transition: "color 0.2s" }}>
            {item.title}
          </div>
        </Link>
        <div className="listing-price">Rs. {Number(item.price).toFixed(2)}</div>
        <div
          className="listing-desc"
          style={{
            color: "#555",
            fontSize: "0.95rem",
            margin: "8px 0",
            lineHeight: 1.4,
          }}
        >
          {item.description
            ? `${item.description.slice(0, 80)}${item.description.length > 80 ? "..." : ""}`
            : "No description"}
        </div>
        <div className="listing-meta">
          <span>{item.sellerName}</span>
          <span>{timeAgo(item.postedAt)}</span>
        </div>
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            color: "#52606d",
            fontSize: "0.9rem",
          }}
        >
          <span>{item.category}</span>
          <span>{item.college}</span>
          <span>{item.department}</span>
          <span>{item.year}</span>
        </div>
        {user?.id !== item.userId && (
          <div
            style={{ marginTop: "8px", color: "#7f8c8d", fontSize: "0.9rem" }}
          >
            Contact details stay private until you continue the deal in chat.
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "12px",
          }}
        >
          {user?.id !== item.userId && (
            <Link
              to={`/dashboard?tab=messages&user=${item.userId}&name=${encodeURIComponent(item.sellerName || "Seller")}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                background: "#2b84ea",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              <i className="fas fa-comment-dots"></i>
              Message Seller
            </Link>
          )}
          {adminMode && (
            <button
              type="button"
              onClick={() => onAdminRemove?.(item.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#e74c3c",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: "8px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              <i className="fas fa-trash"></i>
              Remove Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
