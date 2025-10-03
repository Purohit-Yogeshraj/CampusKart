<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: auth.html");
    exit;
}

$id = $_GET['id'] ?? 0;
$con = new mysqli("localhost", "root", "", "college_project");

// Fetch ad (only if owned by user)
$stmt = $con->prepare("SELECT * FROM listings WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("<script>alert('Ad not found or access denied.'); window.location.href='sell.php';</script>");
}
$ad = $result->fetch_assoc();
$stmt->close();
$con->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Edit Ad - CampusKart</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="sell.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <style>
    #edit-image-preview {
      margin-top: 10px;
      display: none;
    }
    #edit-image-preview img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo"><a href="index.html"><img src="images/logo.png" alt="CampusKart Logo"/></a></div>
    <ul class="nav-links">
      <li><a class="nav-link" href="index.html">Home</a></li>
      <li><a class="nav-link" href="buy.php">Buy</a></li>
      <li><a class="nav-link" href="sell.php">Sell</a></li>
      <li><a class="nav-link" href="index.html#developers-section">About us</a></li>
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
    <div class="sell-form">
      <h2 class="form-header">Edit Your Ad</h2>
      <form id="edit-ad-form">
        <input type="hidden" id="ad-id" value="<?= $ad['id'] ?>">
        
        <div class="form-group">
          <label><i class="fas fa-tag"></i> Item Title</label>
          <input type="text" id="edit-title" class="form-control" value="<?= htmlspecialchars($ad['title']) ?>" required />
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-list"></i> Category</label>
          <select id="edit-category" class="form-control" required>
            <option value="">Select Category</option>
            <option value="Books" <?= $ad['category']=='Books'?'selected':'' ?>>Books</option>
            <option value="Electronics" <?= $ad['category']=='Electronics'?'selected':'' ?>>Electronics</option>
            <option value="Furniture" <?= $ad['category']=='Furniture'?'selected':'' ?>>Furniture</option>
            <option value="Clothing" <?= $ad['category']=='Clothing'?'selected':'' ?>>Clothing</option>
            <option value="Others" <?= $ad['category']=='Others'?'selected':'' ?>>Others</option>
          </select>
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-dollar-sign"></i> Price (₹)</label>
          <input type="number" id="edit-price" class="form-control" value="<?= $ad['price'] ?>" min="1" required />
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-phone"></i> Phone Number</label>
          <input type="tel" id="edit-phone" class="form-control" value="<?= htmlspecialchars($ad['phone']) ?>" pattern="[0-9]{10}" required />
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-map-marker-alt"></i> Location</label>
          <input type="text" id="edit-location" class="form-control" value="<?= htmlspecialchars($ad['location']) ?>" required />
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-comment"></i> Description</label>
          <textarea id="edit-description" class="form-control" rows="4" required><?= htmlspecialchars($ad['description']) ?></textarea>
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-image"></i> Current Image</label>
          <?php if (!empty($ad['image_path']) && file_exists($ad['image_path'])): ?>
            <img src="<?= htmlspecialchars($ad['image_path']) ?>" 
                 alt="Current" 
                 style="max-width:100%; max-height:200px; border-radius:8px; margin:10px 0;">
            <div><small>Upload new image to replace (optional)</small></div>
          <?php else: ?>
            <div style="color:#7f8c8d;">No image uploaded</div>
          <?php endif; ?>
          <input type="file" id="edit-image" class="form-control" accept="image/jpeg,image/png" />
          <div id="edit-image-preview">
            <img src="" alt="New Preview" />
          </div>
        </div>
        
        <button type="submit" class="btn-submit">Update Ad</button>
        <a href="sell.php" style="display:block; text-align:center; margin-top:15px; color:#2b84ea;">← Back to My Ads</a>
      </form>
    </div>
  </div>

  <footer class="footer">
    <?php include 'footer.html'; ?>
  </footer>

  <script>
    // Image preview for new upload
    document.getElementById('edit-image').addEventListener('change', function(e) {
      const preview = document.getElementById('edit-image-preview');
      const img = preview.querySelector('img');
      if (e.target.files[0]) {
        img.src = URL.createObjectURL(e.target.files[0]);
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    });

    // Form submission
    document.getElementById("edit-ad-form").addEventListener("submit", function(e) {
      e.preventDefault();
      
      const id = document.getElementById('ad-id').value;
      const title = document.getElementById('edit-title').value.trim();
      const category = document.getElementById('edit-category').value;
      const price = document.getElementById('edit-price').value;
      const phone = document.getElementById('edit-phone').value.trim();
      const location = document.getElementById('edit-location').value.trim();
      const description = document.getElementById('edit-description').value.trim();

      // Validation
      if (!title || !category || !price || !phone || !location || !description) {
        alert("❌ Please fill all required fields.");
        return;
      }

      if (!/^[0-9]{10}$/.test(phone)) {
        alert("❌ Phone must be 10 digits (e.g. 9876543210).");
        return;
      }

      if (parseFloat(price) <= 0) {
        alert("❌ Price must be greater than 0.");
        return;
      }

      // Handle image
      const imageFile = document.getElementById('edit-image').files[0];
      if (imageFile) {
        const validTypes = ['image/jpeg', 'image/png'];
        const maxSize = 5 * 1024 * 1024;
        if (!validTypes.includes(imageFile.type)) {
          alert('❌ JPG/PNG only.');
          return;
        }
        if (imageFile.size > maxSize) {
          alert('❌ Image < 5MB.');
          return;
        }
      }

      // Create FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('phone', phone);
      formData.append('location', location);
      formData.append('description', description);
      if (imageFile) formData.append('image', imageFile);

      // Send to update-ad.php
      fetch(`update-ad.php?id=${id}`, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        if (data.success) {
          window.location.href = 'sell.php';
        }
      })
      .catch(err => {
        alert('❌ Error: ' + (err.message || err));
      });
    });
  </script>
</body>
</html>