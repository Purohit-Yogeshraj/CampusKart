import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { ListingCard } from "../components/ListingCard";
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

function sortListingsForUser(listings, user) {
  if (!user?.department) {
    return listings;
  }

  return [...listings].sort((a, b) => {
    const aText = `${a.title} ${a.description}`.toLowerCase();
    const bText = `${b.title} ${b.description}`.toLowerCase();
    const department = user.department.toLowerCase();
    const aScore =
      (a.category === "Textbooks" || a.category === "Notes" ? 2 : 0) +
      (aText.includes(department) ? 3 : 0);
    const bScore =
      (b.category === "Textbooks" || b.category === "Notes" ? 2 : 0) +
      (bText.includes(department) ? 3 : 0);
    return bScore - aScore;
  });
}

export function BuyPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("");
  const [department, setDepartment] = useState("");
  const [listings, setListings] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges()
      .then(setColleges)
      .catch((error) => console.error("Failed to load colleges", error));
  }, []);

  async function loadListings(
    nextSearch = search,
    nextCategory = category,
    nextCollege = college,
    nextYear = year,
    nextDepartment = department,
  ) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (nextSearch) params.set("search", nextSearch);
      if (nextCategory) params.set("category", nextCategory);
      if (nextCollege) params.set("college", nextCollege);
      if (nextYear) params.set("year", nextYear);
      if (nextDepartment) params.set("department", nextDepartment);

      const query = params.toString();
      const data = await request(`/listings${query ? `?${query}` : ""}`);
      setListings(sortListingsForUser(data.listings, user));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings("", "", "", "", "");
  }, [user]);

  async function handleAdminRemove(listingId) {
    const reason = window.prompt(
      "Why are you removing this listing?",
      "Invalid or fake listing",
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
      await loadListings();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <>
      <Navbar active="buy" />
      <div className="page-container">
        <div className="page-header">
          <h1>Browse Campus Listings</h1>
          <p>
            Find verified VNSGU listings with filters for category, college, and
            study year.
          </p>
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
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="filter-input"
            value={college}
            onChange={(event) => setCollege(event.target.value)}
          >
            <option value="">All Colleges</option>
            {colleges.map((option) => (
              <option key={option.slug} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
          <select
            className="filter-input"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="">Any Year</option>
            {years.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="filter-input"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            <option value="">Any Course</option>
            {departments.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            className="btn-search"
            type="button"
            id="search-btn"
            onClick={() => loadListings()}
          >
            Search
          </button>
        </div>

        <div className="listings-grid" id="listings-container">
          {loading ? (
            <p>Loading listings...</p>
          ) : listings.length > 0 ? (
            listings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                adminMode={user?.role === "admin"}
                onAdminRemove={handleAdminRemove}
              />
            ))
          ) : (
            <p>No listings available.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
