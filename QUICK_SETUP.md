# CampusKart - Quick Setup Guide

## 🚀 Backend Setup (Server)

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create `.env` File

Create a file named `.env` in the `server` directory:

```
MONGODB_URI=mongodb://localhost:27017/campuskart
JWT_SECRET=your_super_secret_key_change_this_in_production
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Step 4: Ensure MongoDB is Running

```bash
# On Windows (if MongoDB installed)
net start MongoDB

# On Mac (if using Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### Step 5: Start Server

```bash
npm run dev
```

Server should be running at: **http://localhost:5000**

---

## 💻 Frontend Setup (Client)

### Step 1: In New Terminal, Navigate to Client

```bash
cd client
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

Frontend should be running at: **http://localhost:5173**

---

## ✅ Verification Checklist

### 1. Test API Health

```bash
curl http://localhost:5000/api/health
```

Should return: `{"success":true,"message":"CampusKart API is running"}`

### 2. Test Authentication

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Test User",
    "gender": "male",
    "dob": "2005-01-15",
    "email": "test@gmail.com",
    "contact": "9876543210",
    "enrollmentNo": "VN12345678",
    "college": "VNSGU Main Campus",
    "department": "BCA",
    "semester": 1,
    "passingYear": 2024,
    "pass1": "password123",
    "pass2": "password123"
  }'
```

### 3. Open Browser

Go to: **http://localhost:5173**

You should see the CampusKart homepage.

---

## 🔑 Creating Admin Account

### Method 1: Direct Database Update

```bash
# Connect to MongoDB
mongosh

# Use database
use campuskart

# Find a user and make them admin
db.users.updateOne(
  { email: "admin@gmail.com" },
  { $set: { role: "admin", isVerified: true } }
)
```

### Method 2: Update via Backend Script (Create file: `server/src/scripts/createAdmin.js`)

```javascript
import db from "../config/db.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

async function createAdmin() {
  await db.connect();

  const admin = await User.create({
    username: "Admin User",
    gender: "male",
    dob: new Date("2000-01-01"),
    email: "admin@vnsgu.ac.in",
    contact: "9876543210",
    enrollmentNo: "ADMIN001",
    college: "VNSGU Main Campus",
    department: "BCA",
    semester: 1,
    passingYear: 2025,
    passwordHash: await bcrypt.hash("admin123", 10),
    role: "admin",
    isVerified: true,
    idCardStatus: "verified",
  });

  console.log("Admin created:", admin.email);
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
```

Then run: `node src/scripts/createAdmin.js`

---

## 📁 Project Structure

```
CampusKArt/
├── server/
│   ├── src/
│   │   ├── app.js                 # Express app
│   │   ├── server.js              # Socket.io integration
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js  # Auth logic
│   │   │   ├── listingController.js
│   │   │   ├── chatController.js  # Chat/Messaging
│   │   │   ├── adminController.js # Admin panel
│   │   │   ├── reviewController.js # Reviews/Ratings
│   │   │   ├── wishlistController.js # Wishlist
│   │   │   └── dashboardController.js # User dashboard
│   │   ├── models/
│   │   │   ├── User.js            # Enhanced with VNSGU fields
│   │   │   ├── Listing.js         # Enhanced with categories
│   │   │   ├── Message.js         # NEW
│   │   │   ├── Review.js          # NEW
│   │   │   └── Wishlist.js        # NEW
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── listingRoutes.js
│   │   │   ├── chatRoutes.js      # NEW
│   │   │   ├── adminRoutes.js     # NEW
│   │   │   ├── reviewRoutes.js    # NEW
│   │   │   ├── wishlistRoutes.js  # NEW
│   │   │   └── dashboardRoutes.js # NEW
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   ├── upload.js          # Enhanced with ID card upload
│   │   │   └── token.js
│   │   └── scripts/
│   │       └── seedDemoListings.js
│   ├── uploads/                   # File storage
│   │   └── id-cards/              # ID card verification images
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── App.jsx                # Updated with new routes
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AuthPage.jsx       # Enhanced signup form
│   │   │   ├── BuyPage.jsx
│   │   │   ├── SellPage.jsx
│   │   │   ├── EditListingPage.jsx
│   │   │   └── DashboardPage.jsx  # NEW
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Updated with user menu
│   │   │   ├── ChatComponent.jsx  # NEW
│   │   │   ├── WishlistHeart.jsx  # NEW
│   │   │   ├── ListingCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── time.js
│   │   └── css files:
│   │       ├── style.css           # Updated with user menu
│   │       ├── auth.css            # Enhanced with form sections
│   │       ├── dashboard.css       # NEW
│   │       ├── chat.css            # NEW
│   │       ├── buy.css
│   │       ├── sell.css
│   │       └── main.jsx
│   └── package.json               # Added socket.io-client
│
└── README.md
└── IMPLEMENTATION_GUIDE.md        # NEW - Detailed documentation
```

---

## 🧪 Testing the Features

### 1. Signup with VNSGU Details

```
1. Go to http://localhost:5173/auth
2. Click "Sign Up"
3. Fill form with:
   - Email: xxx@vnsgu.ac.in (or Gmail)
   - Enrollment: VN12345678
   - College: Choose from dropdown
   - Department: Choose from dropdown
   - Upload college ID image
4. Submit
```

### 2. Admin Verification

```
1. Login as admin (if created)
2. Visit: (admin panel URL - needs frontend implementation)
3. Review pending ID cards
4. Approve/Reject
```

### 3. Create Listing (After Verification)

```
1. Login as verified user
2. Go to /sell
3. Fill form including:
   - Category (8 smart options)
   - College
   - Year
4. Upload image
5. Submit - listing becomes "active"
```

### 4. Chat System

```
1. Two users login (different browsers/incognito)
2. User A clicks on User B's listing
3. Click "Message Seller"
4. Chat opens with Socket.io connected
5. Send/receive messages in real-time
```

### 5. Reviews System

```
1. After transaction
2. Go to user's profile
3. Click "Rate Seller/Buyer"
4. Submit rating + comment
5. Rating updates user profile
```

### 6. Wishlist

```
1. Login
2. View listing
3. Click heart icon
4. Heart fills and item saved
5. Go to dashboard → wishlist to view
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"

```
Solution:
- Start MongoDB service
- Check MONGODB_URI in .env
- Verify MongoDB is running: mongosh
```

### Error: "CORS issues"

```
Solution:
- Check CLIENT_URL in .env
- Verify CORS in server/src/app.js
- Clear browser cookies/cache
```

### Error: "File upload folder not found"

```
Solution:
- Server creates /uploads/id-cards automatically
- If not, manually create: mkdir -p server/uploads/id-cards
```

### Error: "Socket.io not connecting"

```
Solution:
- Check browser console for errors
- Verify Socket.io package installed
- Check server is running with HTTP not HTTPS
```

### Email not validating

```
Solution:
- Must be @vnsgu.ac.in or Gmail
- Check email in authController.js
- Case-insensitive but must match domain
```

---

## 📊 Database Initialization

### Import Test Data

```bash
# In server directory
node src/scripts/seedDemoListings.js
```

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS for production
- [ ] Enable CORS only for your domain
- [ ] Use environment variables (never hardcode)
- [ ] Set MongoDB authentication
- [ ] Enable file upload validation
- [ ] Implement rate limiting
- [ ] Add security headers

---

## 📈 Performance Tips

1. **Enable Database Indexes**
   - Already added in models (see schema)

2. **Use Lean Queries**
   - Frontend already uses when not need full documents

3. **Pagination**
   - Implement in frontend for listings
   - Messages paginated in chat

4. **Caching**
   - Consider Redis for frequently accessed data
   - Cache user ratings

5. **CDN for Images**
   - Upload ID cards and listing images to CDN
   - Update paths accordingly

---

## 🚀 Production Deployment

### Recommended Order:

1. Deploy database (MongoDB Atlas)
2. Deploy server (Heroku/Railway/Render)
3. Deploy frontend (Vercel/Netlify)
4. Update API URLs in frontend
5. Set production environment variables

### Before Going Live:

- [ ] All tests passing
- [ ] Admin created
- [ ] File upload verified
- [ ] Chat tested with multiple users
- [ ] Payments (if applicable) configured
- [ ] Admin can verify users
- [ ] Error handling complete

---

## 📞 Getting Help

- Check IMPLEMENTATION_GUIDE.md for detailed feature docs
- Check browser console for errors
- Check server terminal for API errors
- MongoDB Compass for database inspection
- Postman for API testing

---

**Happy coding! 🎉**

For detailed feature documentation, see: **IMPLEMENTATION_GUIDE.md**
