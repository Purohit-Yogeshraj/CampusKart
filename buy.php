<?php
// Start session and check login (same as sell.php)
session_start();
$loggedIn = isset($_SESSION['user_id']);
$user = null;

if ($loggedIn) {
    $con = new mysqli("localhost", "root", "", "college_project");
    if (!$con->connect_error) {
        $result = $con->query("SELECT username FROM registration WHERE id = {$_SESSION['user_id']}");
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
        }
    }
    $con->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Buy - CampusKart</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="buy.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body>
  <!-- Navbar (now shows user greeting if logged in) -->
  <nav class="navbar">
    <div class="logo"><a href="index.html"><img src="images/logo.png" alt="CampusKart Logo"/></a></div>
    <ul class="nav-links">
      <li><a class="nav-link" href="index.php">Home</a></li>
      <li><a class="nav-link active" href="buy.php">Buy</a></li>
      <li><a class="nav-link" href="sell.php">Sell</a></li>
      <li><a class="nav-link" href="index.php#developers-section">About us</a></li>
    </ul>
    <div class="auth-buttons">
  <?php if ($loggedIn && $user): ?>
    <a href="logout.php" class="btn-login-signup" style="background:#e74c3c; color:white;">Logout</a>
  <?php else: ?>
    <a href="auth.html" class="btn-login-signup">Login/Sign Up</a>
  <?php endif; ?>
</div>
  </nav>

  <div class="page-container">
    <div class="page-header">
      <h1>Browse Campus Listings</h1>
      <p>Find books, gadgets, furniture & more from students like you</p>
    </div>

    <div class="filters">
      <input type="text" class="filter-input" placeholder="Search items..." id="search-input" />
      <select class="filter-input" id="category-filter">
        <option value="">All Categories</option>
        <option>Books</option>
        <option>Electronics</option>
        <option>Furniture</option>
        <option>Clothing</option>
      </select>
      <button class="btn-search" id="search-btn">Search</button>
    </div>

    <div class="listings-grid" id="listings-container">
      <p>Loading listings...</p>
    </div>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <?php include 'footer.php'; ?>
  </footer>

  <script>
    function loadListings() {
      fetch('fetch-listings.php')
        .then(res => res.json())
        .then(listings => {
          const container = document.getElementById('listings-container');
          if (listings.length === 0) {
            container.innerHTML = '<p>No listings available.</p>';
            return;
          }

          container.innerHTML = listings.map(item => `
            <div class="listing-card">
              <div class="listing-img">
                ${item.image_path ? 
                  `<img src="${item.image_path}" alt="Item" style="width:100%; height:150px; object-fit:cover;">` : 
                  `<div style="display:flex;align-items:center;justify-content:center;height:150px;color:#aaa;font-size:2rem;">${getIcon(item.category)}</div>`
                }
              </div>
              <div class="listing-body">
                <div class="listing-title">${item.title}</div>
                <div class="listing-price">₹${parseFloat(item.price).toFixed(2)}</div>
                <div class="listing-desc" style="color:#555; font-size:0.95rem; margin:8px 0; line-height:1.4;">
                  ${item.description ? item.description.substring(0, 80) + (item.description.length > 80 ? '...' : '') : 'No description'}
                </div>
                <div class="listing-meta">
                  <span>${item.seller_name}</span>
                  <span>${timeAgo(item.posted_at)}</span>
                </div>
                <div class="listing-contact" style="margin-top:10px; color:#2b84ea; font-weight:600;">
                  📞 <span>${item.phone}</span>
                </div>
              </div>
            </div>
          `).join('');
        })
        .catch(err => {
          document.getElementById('listings-container').innerHTML = '<p>Error loading listings.</p>';
        });
    }

    function getIcon(category) {
      const icons = {
        Books: '📚',
        Electronics: '💻',
        Furniture: '🛏️',
        Clothing: '👕',
        Others: '📦'
      };
      return icons[category] || '🏷️';
    }

    function timeAgo(dateString) {
      const now = new Date();
      const posted = new Date(dateString);
      const diffMs = now - posted;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHrs < 24) return `${diffHrs} hr ago`;
      return `${diffDays} day ago`;
    }

    document.addEventListener('DOMContentLoaded', loadListings);
    document.getElementById('search-btn').addEventListener('click', loadListings);
  </script>
</body>
</html>