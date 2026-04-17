import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Slight delay ensures React has finished rendering the DOM
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <Navbar active="home" />

      <div className="hero-section">
        <div className="hero-content">
          <h1>
            Welcome to <span>CampusKart</span>
          </h1>
          <p>
            Your one-stop shop for <span className="highlight">Buying</span> and
            <span className="highlight"> Selling</span> used items on campus.
          </p>
          <div className="b-s_btn">
            <Link to="/buy" className="btn">
              Buy
            </Link>
            <Link to="/sell" className="btn">
              Sell
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="/images/student_trading.png"
            alt="Students trading illustration"
          />
        </div>
      </div>

      <div className="how-it-works-section" id="how-it-works-section">
        <div className="how-head">
          <h2>
            How <span>CampusKart</span> Works
          </h2>
          <p>Trade smart in just 3 simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon">
              <img src="/images/camera.png" alt="Post Item" />
            </div>
            <div className="step-number">01</div>
            <div className="step-title">Post Your Item</div>
            <div className="step-desc">
              List your book, gadget, or anything in 60 seconds. Add photos,
              price, and location.
            </div>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <img src="/images/communication.png" alt="Chat with Buyer" />
            </div>
            <div className="step-number">02</div>
            <div className="step-title">Chat with Buyer</div>
            <div className="step-desc">
              Get messages from interested students. Negotiate, ask questions,
              agree on deal.
            </div>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <img src="/images/handshake.png" alt="Meet and Exchange" />
            </div>
            <div className="step-number">03</div>
            <div className="step-title">Meet & Exchange</div>
            <div className="step-desc">
              Meet safely on campus, inspect item, pay & collect. No shipping,
              no scams!
            </div>
          </div>
        </div>
      </div>

      <div className="feature-section">
        <div className="feature-head">
          <h2>
            <span>Empowering Students</span>Through Smarter Trade
          </h2>
        </div>
        <div className="features">
          <div className="feature">
            <div className="feature-ico">
              <img src="/images/feature1.1.png" alt="Built for campus" />
            </div>
            <div className="feature-title">
              <h3>Built for Your Campus Life</h3>
            </div>
            <div className="feature-description">
              <p>
                Specifically designed for students, CampusKart makes trading
                within your campus community simple, reliable, and hassle-free.
              </p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-ico">
              <img src="/images/feature-2.png" alt="Deals" />
            </div>
            <div className="feature-title">
              <h3>Deals That Fit Your Budget</h3>
            </div>
            <div className="feature-description">
              <p>
                Get the things you need at student-friendly prices, affordable
                deals that make everyday campus life easier and lighter on your
                wallet.
              </p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-ico">
              <img src="/images/feature-3.png" alt="Secure" />
            </div>
            <div className="feature-title">
              <h3>Fast, Simple & Secure</h3>
            </div>
            <div className="feature-description">
              <p>
                From browsing to checkout, every step is quick and safe, so you
                can buy or sell with complete confidence and zero stress.
              </p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-ico">
              <img src="/images/feature-4.png" alt="Sustainable" />
            </div>
            <div className="feature-title">
              <h3>Reduce Waste, Reuse Resources</h3>
            </div>
            <div className="feature-description">
              <p>
                Promote sustainability on campus by giving pre-loved items a
                second chance, saving money while helping the environment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="testimonials-section">
        <div className="testimonial-head">
          <h2>
            What <span>Students</span> Are Saying
          </h2>
          <p>Real stories from your campus peers</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="quote-icon">"</div>
            <div className="testimonial-text">
              I sold my old engineering books within 2 hours of posting! Got
              Rs.800, enough for two pizzas. CampusKart is genius!
            </div>
            <div className="student-info">
              <img src="/images/student1.jpg" alt="Ananya Sharma" />
              <div className="student-details">
                <div className="student-name">Ananya Sharma</div>
                <div className="student-dept">CSE, 3rd Year</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote-icon">"</div>
            <div className="testimonial-text">
              Bought a DSLR camera for my photography club at half price. Seller
              was from my own hostel, safe and smooth deal!
            </div>
            <div className="student-info">
              <img src="/images/student2.jpg" alt="Rohan Mehta" />
              <div className="student-details">
                <div className="student-name">Rohan Mehta</div>
                <div className="student-dept">ECE, 2nd Year</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote-icon">"</div>
            <div className="testimonial-text">
              As a fresher, I saved over Rs.3000 on textbooks. CampusKart helped
              me survive my first semester without going broke.
            </div>
            <div className="student-info">
              <img src="/images/student3.jpg" alt="Priya Kapoor" />
              <div className="student-details">
                <div className="student-name">Priya Kapoor</div>
                <div className="student-dept">BBA, 1st Year</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="developers-section" id="developers-section">
        <div className="dev-head">
          <h2>
            Meet the <span>Minds Behind CampusKart</span>
          </h2>
          <p>Built with love by your fellow students</p>
        </div>
        <div className="developers-grid">
          <div className="developer-card">
            <div className="dev-img">
              <img src="/images/vatsal.HEIC" alt="Vatsal Nalavde" />
            </div>
            <div className="dev-name">Vatsal Nalavde</div>
            <div className="dev-quote">
              "Turning caffeine into scalable APIs since day one."
            </div>
          </div>
          <div className="developer-card">
            <div className="dev-img">
              <img src="/images/yogesh.jpg" alt="Yogesh Rajpurohit" />
            </div>
            <div className="dev-name">Yogesh Rajpurohit</div>
            <div className="dev-quote">
              "If it's not pixel-perfect, it's not shipped."
            </div>
          </div>
          <div className="developer-card">
            <div className="dev-img">
              <img src="/images/jaimin.jpg" alt="Jaimin Makhwana" />
            </div>
            <div className="dev-name">Jaimin Makhwana</div>
            <div className="dev-quote">
              "Silent but deadly, like a perfectly optimized query."
            </div>
          </div>
          <div className="developer-card">
            <div className="dev-img">
              <img src="/images/krishna.PNG" alt="Krishna Patil" />
            </div>
            <div className="dev-name">Krishna Patil</div>
            <div className="dev-quote">
              "Great products are built when ideas, details, and teamwork click
              together."
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
