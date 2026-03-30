import { SERVER_BASE_URL } from "../utils/api";
import { timeAgo } from "../utils/time";

function getCategoryIcon(category) {
  const icons = {
    Books: "📚",
    Electronics: "💻",
    Furniture: "🛏️",
    Clothing: "👕",
    Others: "📦",
  };

  return icons[category] || "🏷️";
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

export function ListingCard({ item, editable = false, onEdit, onDelete }) {
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
        <div><strong>{item.title}</strong></div>
        <div>₹{Number(item.price).toFixed(2)} | {item.category}</div>
        <div>📞 {item.phone}</div>
        <div className="ad-actions">
          <button className="ad-btn edit-btn" type="button" onClick={() => onEdit(item.id)}>
            <i className="fas fa-pen"></i> Edit
          </button>
          <button className="ad-btn delete-btn" type="button" onClick={() => onDelete(item.id)}>
            <i className="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listing-card">
      <div className="listing-img">
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
              color: "#aaa",
              fontSize: "2rem",
            }}
          >
            {getCategoryIcon(item.category)}
          </div>
        )}
      </div>
      <div className="listing-body">
        <div className="listing-title">{item.title}</div>
        <div className="listing-price">₹{Number(item.price).toFixed(2)}</div>
        <div
          className="listing-desc"
          style={{ color: "#555", fontSize: "0.95rem", margin: "8px 0", lineHeight: 1.4 }}
        >
          {item.description
            ? `${item.description.slice(0, 80)}${item.description.length > 80 ? "..." : ""}`
            : "No description"}
        </div>
        <div className="listing-meta">
          <span>{item.sellerName}</span>
          <span>{timeAgo(item.postedAt)}</span>
        </div>
        <div className="listing-contact" style={{ marginTop: "10px", color: "#2b84ea", fontWeight: 600 }}>
          📞 <span>{item.phone}</span>
        </div>
      </div>
    </div>
  );
}
