import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { request } from "../utils/api";

export function WishlistHeart({ listingId, size = "1.2rem" }) {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || !listingId) return;
    checkWishlist();
  }, [user, listingId]);

  const checkWishlist = async () => {
    try {
      const data = await request(`/wishlist/check/${listingId}`);
      setIsInWishlist(data.inWishlist);
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert("Please login to add to wishlist");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const data = isInWishlist
        ? await request(`/wishlist/remove/${listingId}`, { method: "DELETE" })
        : await request("/wishlist/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listingId }),
          });

      if (data.success) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`wishlist-btn ${isInWishlist ? "active" : ""}`}
      onClick={handleWishlist}
      style={{ fontSize: size }}
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      type="button"
    >
      <i className={`${isInWishlist ? "fas" : "far"} fa-heart`}></i>
    </button>
  );
}
