<?php 
// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    // Redirect to login page if not logged in
    header("Location: auth.html");
    exit();
}

// User is logged in, proceed with the rest of the page
$loggedIn = true;
$user = null;
$myListings = false;

// Get user info
$con = new mysqli("localhost", "root", "", "college_project");
if (!$con->connect_error) {
    // Get user info
    $stmt = $con->prepare("SELECT username FROM registration WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
    }
    $stmt->close();
    
    // Get user's listings
    $stmt2 = $con->prepare("SELECT * FROM listings WHERE user_id = ? ORDER BY posted_at DESC");
    $stmt2->bind_param("i", $_SESSION['user_id']);
    $stmt2->execute();
    $myListings = $stmt2->get_result();
    $stmt2->close();
}
$con->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>My Ads - CampusKart</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="sell.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <style>
    .my-ads-section { margin-top: 40px; }
    .my-ads-header { text-align: center; margin-bottom: 20px; color: #2c3e50; }
    .my-listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .my-ad-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 15px;
      border-left: 4px solid #2b84ea;
    }
    .ad-actions {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }
    .ad-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 5px;
      font-size: 0.85rem;
      cursor: pointer;
      font-weight: 600;
    }
    .edit-btn { background: #f1c40f; color: #1a1a1a; }
    .delete-btn { background: #e74c3c; color: white; }
    #image-preview {
      margin-top: 10px;
      display: none;
    }
    #image-preview img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <!-- Navbar -->
  <nav class="navbar">
    <div class="logo"><a href="index.php"><img src="images/logo.png" alt="CampusKart Logo"/></a></div>
    <ul class="nav-links">
      <li><a class="nav-link" href="index.php">Home</a></li>
      <li><a class="nav-link" href="buy.php">Buy</a></li>
      <li><a class="nav-link active" href="sell.php">Sell</a></li>
      <li><a class="nav-link" href="index.php#developers-section">About us</a></li>
    </ul>
    <div class="auth-buttons">
      <?php if ($loggedIn && $user): ?>
        <a href="logout.php" class="btn-login-signup" style="background:#e74c3c; color:white;">Logout</a>
      <?php endif; ?>
    </div>
  </nav>

  <div class="page-container">
    <!-- Post New Ad Form -->
    <div class="sell-form">
      <h2 class="form-header">Post a New Item</h2>
      <form id="post-ad-form">
        <div class="form-group">
          <label><i class="fas fa-tag"></i> Item Title</label>
          <input type="text" id="ad-title" class="form-control" placeholder="e.g. Physics Textbook" required />
        </div>
        <div class="form-group">
          <label><i class="fas fa-list"></i> Category</label>
          <select id="ad-category" class="form-control" required>
            <option value="">Select Category</option>
            <option>Books</option>
            <option>Electronics</option>
            <option>Furniture</option>
            <option>Clothing</option>
            <option>Others</option>
          </select>
        </div>
        <div class="form-group">
          <label><i class="fas fa-dollar-sign"></i> Price (₹)</label>
          <input type="number" id="ad-price" class="form-control" placeholder="e.g. 500" min="1" required />
        </div>
        <div class="form-group">
          <label><i class="fas fa-phone"></i> Your Phone Number</label>
          <input type="tel" id="ad-phone" class="form-control" placeholder="e.g. 9876543210" pattern="[0-9]{10}" required />
        </div>
        <div class="form-group">
          <label><i class="fas fa-map-marker-alt"></i> Location</label>
          <input type="text" id="ad-location" class="form-control" placeholder="e.g. Hostel A, Block 3" required />
        </div>
        <div class="form-group">
          <label><i class="fas fa-comment"></i> Description</label>
          <textarea id="ad-description" class="form-control" rows="4" placeholder="Describe condition, reason for selling, etc." required></textarea>
        </div>
        <div class="form-group">
          <label><i class="fas fa-image"></i> Item Photo (Optional)</label>
          <input type="file" id="ad-image" class="form-control" accept="image/jpeg,image/png" />
          <div id="image-preview">
            <img src="" alt="Preview" />
          </div>
        </div>
        <button type="submit" class="btn-submit">Post Ad</button>
      </form>
    </div>

    <!-- My Ads Section -->
    <div class="my-ads-section">
      <h2 class="my-ads-header">Your Posted Ads</h2>
      <?php if ($myListings && $myListings->num_rows > 0): ?>
        <div class="my-listings-grid">
          <?php while ($ad = $myListings->fetch_assoc()): ?>
            <div class="my-ad-card">
              <?php if (!empty($ad['image_path']) && file_exists($ad['image_path'])): ?>
                <img src="<?= htmlspecialchars($ad['image_path']) ?>" 
                     alt="Item" 
                     style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:10px;">
              <?php else: ?>
                <div style="background:#f1f1f1; height:150px; display:flex; align-items:center; justify-content:center; border-radius:8px; margin-bottom:10px; color:#777;">
                  📷 No Image
                </div>
              <?php endif; ?>
              <div><strong><?= htmlspecialchars($ad['title']) ?></strong></div>
              <div>₹<?= number_format($ad['price'], 2) ?> | <?= htmlspecialchars($ad['category']) ?></div>
              <div>📞 <?= htmlspecialchars($ad['phone']) ?></div>
              <div class="ad-actions">
                <button class="ad-btn edit-btn" onclick="editAd(<?= $ad['id'] ?>)">Edit</button>
                <button class="ad-btn delete-btn" onclick="deleteAd(<?= $ad['id'] ?>)">Delete</button>
              </div>
            </div>
          <?php endwhile; ?>
        </div>
      <?php else: ?>
        <p style="text-align:center; color:#7f8c8d;">You haven't posted any ads yet.</p>
      <?php endif; ?>
    </div>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <?php include 'footer.php'; ?>
  </footer>

<script>
  // Image preview
  document.getElementById('ad-image').addEventListener('change', function(e) {
    const preview = document.getElementById('image-preview');
    const img = preview.querySelector('img');
    if (e.target.files[0]) {
      img.src = URL.createObjectURL(e.target.files[0]);
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  });

  // Form submission
  document.getElementById("post-ad-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const title = document.getElementById('ad-title').value.trim();
    const category = document.getElementById('ad-category').value;
    const price = document.getElementById('ad-price').value;
    const phone = document.getElementById('ad-phone').value.trim();
    const location = document.getElementById('ad-location').value.trim();
    const description = document.getElementById('ad-description').value.trim();

    if (!title || !category || !price || !phone || !location || !description) {
      alert("❌ Please fill all required fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("❌ Phone number must be exactly 10 digits (e.g. 9876543210).");
      return;
    }

    if (parseFloat(price) <= 0) {
      alert("❌ Price must be greater than 0.");
      return;
    }

    const imageFile = document.getElementById('ad-image').files[0];
    if (imageFile) {
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024;
      if (!validTypes.includes(imageFile.type)) {
        alert('❌ Please upload JPG or PNG image.');
        return;
      }
      if (imageFile.size > maxSize) {
        alert('❌ Image must be less than 5MB.');
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('phone', phone);
    formData.append('location', location);
    formData.append('description', description);
    if (imageFile) formData.append('image', imageFile);

    fetch('post-ad.php', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.success) {
        document.getElementById("post-ad-form").reset();
        document.getElementById('image-preview').style.display = 'none';
        window.location.reload();
      }
    })
    .catch(err => {
      alert('❌ Error: ' + (err.message || err));
    });
  });

  function editAd(id) {
    window.location.href = `edit-ad.php?id=${id}`;
  }

  function deleteAd(id) {
    if (confirm('Are you sure you want to delete this ad?')) {
      fetch(`delete-ad.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          if (data.success) {
            window.location.reload();
          }
        })
        .catch(err => {
          alert('❌ Error: ' + (err.message || err));
        });
    }
  }
</script>
</body>
</html>