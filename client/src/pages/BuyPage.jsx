import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { ListingCard } from "../components/ListingCard";
import { Navbar } from "../components/Navbar";
import { request } from "../utils/api";

export function BuyPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadListings(nextSearch = search, nextCategory = category) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (nextSearch) params.set("search", nextSearch);
      if (nextCategory) params.set("category", nextCategory);

      const query = params.toString();
      const data = await request(`/listings${query ? `?${query}` : ""}`);
      setListings(data.listings);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings("", "");
  }, []);

  return (
    <>
      <Navbar active="buy" />
      <div className="page-container">
        <div className="page-header">
          <h1>Browse Campus Listings</h1>
          <p>Find books, gadgets, furniture & more from students like you</p>
        </div>

        <div className="filters">
          <input
            type="text"
            className="filter-input"
            placeholder="Search items..."
            id="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="filter-input"
            id="category-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Others">Others</option>
          </select>
          <button className="btn-search" type="button" id="search-btn" onClick={() => loadListings()}>
            Search
          </button>
        </div>

        <div className="listings-grid" id="listings-container">
          {loading ? (
            <p>Loading listings...</p>
          ) : listings.length > 0 ? (
            listings.map((item) => <ListingCard key={item.id} item={item} />)
          ) : (
            <p>No listings available.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

