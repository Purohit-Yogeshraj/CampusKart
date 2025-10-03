<?php
// Start session and check login status
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CampusKart</title>
    <link rel="stylesheet" href="style.css" />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />
  </head>
  <body>
    <!-- Navbar (now dynamic) -->
    <nav class="navbar">
      <div class="logo">
        <a href="index.php">
          <img src="images/logo.png" alt="CampusKart Logo" class="navbar-logo" />
        </a>
      </div>

      <ul class="nav-links">
        <li><a class="nav-link active" href="index.php">Home</a></li>
        <li><a class="nav-link" href="buy.php">Buy</a></li>
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

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Welcome to <span>CampusKart</span></h1>
        <p>
          Your one-stop shop for <span class="highlight">Buying</span> and
          <span class="highlight">Selling</span> used items on campus.
        </p>
        <div class="b-s_btn">
          <a href="buy.php" class="btn">Buy</a>
          <a href="sell.php" class="btn">Sell</a>
        </div>
      </div>
      <div class="hero-image">
        <img
          src="images/student_trading.png"
          alt="Students trading illustration"
        />
      </div>
    </div>

    <!-- How It Works Section -->
    <div class="how-it-works-section" id="how-it-works-section">
      <div class="how-head">
        <h2>How <span>CampusKart</span> Works</h2>
        <p>Trade smart in just 3 simple steps</p>
      </div>
      <div class="steps-container">
        <!-- Step 1 -->
        <div class="step-card">
          <div class="step-icon">
            <img src="./images/camera.png" alt="Post Item" />
          </div>
          <div class="step-number">01</div>
          <div class="step-title">Post Your Item</div>
          <div class="step-desc">
            List your book, gadget, or anything in 60 seconds. Add photos,
            price, and location.
          </div>
        </div>

        <!-- Step 2 -->
        <div class="step-card">
          <div class="step-icon">
            <img src="./images/communication.png" alt="Chat with Buyer" />
          </div>
          <div class="step-number">02</div>
          <div class="step-title">Chat with Buyer</div>
          <div class="step-desc">
            Get messages from interested students. Negotiate, ask questions,
            agree on deal.
          </div>
        </div>

        <!-- Step 3 -->
        <div class="step-card">
          <div class="step-icon">
            <img src="./images/handshake.png" alt="Meet & Exchange" />
          </div>
          <div class="step-number">03</div>
          <div class="step-title">Meet & Exchange</div>
          <div class="step-desc">
            Meet safely on campus, inspect item, pay & collect. No shipping, no
            scams!
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="feature-section">
      <div class="feature-head">
        <h2><span>Empowering Students</span>Through Smarter Trade</h2>
      </div>
      <div class="features">
        <div class="feature">
          <div class="feature-ico">
            <img src="./images/feature1.1.png" alt="Img-F1" />
          </div>
          <div class="feature-title">
            <h3>Built for Your Campus Life</h3>
          </div>
          <div class="feature-description">
            <p>
              Specifically designed for students, CampusKart makes trading within
              your campus community simple, reliable, and hassle-free.
            </p>
          </div>
        </div>
        <div class="feature">
          <div class="feature-ico">
            <img src="./images/feature-2.png" alt="Img-F2" />
          </div>
          <div class="feature-title">
            <h3>Deals That Fit Your Budget</h3>
          </div>
          <div class="feature-description">
            <p>
              Get the things you need at student-friendly prices—affordable
              deals that make everyday campus life easier and lighter on your
              wallet.
            </p>
          </div>
        </div>
        <div class="feature">
          <div class="feature-ico">
            <img src="./images/feature-3.png" alt="Img-F3" />
          </div>
          <div class="feature-title">
            <h3>Fast, Simple & Secure</h3>
          </div>
          <div class="feature-description">
            <p>
              From browsing to checkout, every step is quick and safe, so you
              can buy or sell with complete confidence and zero stress.
            </p>
          </div>
        </div>
        <div class="feature">
          <div class="feature-ico">
            <img src="./images/feature-4.png" alt="Img-F4" />
          </div>
          <div class="feature-title">
            <h3>Reduce Waste, Reuse Resources</h3>
          </div>
          <div class="feature-description">
            <p>
              Promote sustainability on campus by giving pre-loved items a
              second chance—saving money while helping the environment.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Testimonials Section -->
    <div class="testimonials-section">
      <div class="testimonial-head">
        <h2>What <span>Students</span> Are Saying</h2>
        <p>Real stories from your campus peers 🎓</p>
      </div>

      <div class="testimonials-grid">
        <!-- Testimonial 1 -->
        <div class="testimonial-card">
          <div class="quote-icon">“</div>
          <div class="testimonial-text">
            I sold my old engineering books within 2 hours of posting! Got ₹800
            — enough for two pizzas 🍕. CampusKart is genius!
          </div>
          <div class="student-info">
            <img src="./images/student1.jpg" alt="Ananya Sharma" />
            <div class="student-details">
              <div class="student-name">Ananya Sharma</div>
              <div class="student-dept">CSE, 3rd Year</div>
            </div>
          </div>
        </div>

        <!-- Testimonial 2 -->
        <div class="testimonial-card">
          <div class="quote-icon">“</div>
          <div class="testimonial-text">
            Bought a DSLR camera for my photography club at half price. Seller
            was from my own hostel — safe and smooth deal!
          </div>
          <div class="student-info">
            <img src="./images/student2.jpg" alt="Rohan Mehta" />
            <div class="student-details">
              <div class="student-name">Rohan Mehta</div>
              <div class="student-dept">ECE, 2nd Year</div>
            </div>
          </div>
        </div>

        <!-- Testimonial 3 -->
        <div class="testimonial-card">
          <div class="quote-icon">“</div>
          <div class="testimonial-text">
            As a fresher, I saved over ₹3000 on textbooks. CampusKart helped me
            survive my first semester without going broke 😅
          </div>
          <div class="student-info">
            <img src="./images/student3.jpg" alt="Priya Kapoor" />
            <div class="student-details">
              <div class="student-name">Priya Kapoor</div>
              <div class="student-dept">BBA, 1st Year</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Developers Section -->
    <div class="developers-section" id="developers-section">
      <div class="dev-head">
        <h2>Meet the <span>Minds Behind CampusKart</span></h2>
        <p>Built with ❤️ by your fellow students</p>
      </div>
      <div class="developers-grid">
        <!-- Developer 1 -->
        <div class="developer-card">
          <div class="dev-img">
            <img src="./images/vatsal.HEIC" alt="Vatsal Nalavde" />
          </div>
          <div class="dev-name">Vatsal Nalavde</div>
          <div class="dev-role">Project Lead & Backend Developer</div>
          <div class="dev-quote">
            “Turning caffeine into scalable APIs since day one.”
          </div>
        </div>

        <!-- Developer 2 -->
        <div class="developer-card">
          <div class="dev-img">
            <img src="./images/yogesh.jpg" alt="Yogesh Rajpurohit" />
          </div>
          <div class="dev-name">Yogesh Rajpurohit</div>
          <div class="dev-role">Frontend Developer</div>
          <div class="dev-quote">
            “If it’s not pixel-perfect, it’s not shipped.”
          </div>
        </div>

        <!-- Developer 3 -->
        <div class="developer-card">
          <div class="dev-img">
            <img src="./images/jaimin.jpg" alt="Jaimin Makhwana" />
          </div>
          <div class="dev-name">Jaimin Makhwana</div>
          <div class="dev-role">Backend Developer</div>
          <div class="dev-quote">
            “Silent but deadly — like a perfectly optimized query.”
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-col">
          <div class="footer-logo">
            <img src="./images/logo.png" alt="CampusKart Logo" />
          </div>
          <p class="footer-tagline">
            Empowering students to buy, sell & reuse — right on campus.
          </p>
          <div class="social-icons">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-linkedin-in"></i></a>
            <a href="#"><i class="fab fa-github"></i></a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.php">Home</a></li>
            <li><a href="buy.php">Buy</a></li>
            <li><a href="sell.php">Sell</a></li>
            <li><a href="#how-it-works-section">How It Works</a></li>
            <li><a href="#developers-section">About Us</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Contact Us</h4>
          <ul class="contact-info">
            <li>
              <i class="fas fa-map-marker-alt"></i> CampusKart Inc., Surat.
            </li>
            <li><i class="fas fa-envelope"></i> contact@campuskart.edu</li>
            <li><i class="fas fa-phone"></i> +91 98765 43210</li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Stay Updated</h4>
          <p>Get notified about new listings & campus deals.</p>
          <form class="newsletter-form">
            <input type="email" placeholder="Your email" required />
            <button type="submit"><i class="fas fa-paper-plane"></i></button>
          </form>
        </div>
      </div>

      <div class="footer-bottom">
        <p>
          &copy; 2025 CampusKart. Built with ❤️ by Students, for Students. |
          <a href="#">Privacy Policy</a> | <a href="#">Terms of Use</a>
        </p>
      </div>
    </footer>
  </body>
</html>