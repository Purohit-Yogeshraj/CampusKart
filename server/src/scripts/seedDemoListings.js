import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import { User } from "../models/User.js";
import { Listing } from "../models/Listing.js";

dotenv.config();

const demoListings = [
  {
    title: "Dell Inspiron Laptop",
    category: "Electronics",
    price: 18500,
    location: "Boys Hostel Block A",
    college: "SDJ INTERNATIONAL COLLEGE",
    year: "3rd Year",
    description: "Dell Inspiron 15 with charger. Good battery life and perfect for college work.",
    phone: "9876543210",
    imagePath: "/images/laptop.webp",
    demoSellerName: "Arjun Patel",
  },
  {
    title: "TYBCA Semester 5 Book Set",
    category: "Textbooks",
    price: 950,
    location: "Library Gate",
    college: "SDJ INTERNATIONAL COLLEGE",
    year: "Final Year",
    description: "Complete TYBCA notes and textbooks in clean condition, useful for exam prep.",
    phone: "9876543211",
    imagePath: "/images/bookset.jpg",
    demoSellerName: "Priya Shah",
  },
  {
    title: "Wooden Study Table",
    category: "Other",
    price: 2200,
    location: "Girls Hostel Common Area",
    college: "D.R.B. College",
    year: "2nd Year",
    description: "Compact study table with side shelf. Strong and ideal for hostel rooms.",
    phone: "9876543212",
    imagePath: "/images/study_table.webp",
    demoSellerName: "Rohit Verma",
  },
  {
    title: "Scientific Calculator",
    category: "Electronics",
    price: 650,
    location: "Main Campus Canteen",
    college: "SASCMA College",
    year: "1st Year",
    description: "Casio scientific calculator, lightly used and fully working.",
    phone: "9876543213",
    imagePath: "/images/calculator.webp",
    demoSellerName: "Neha Joshi",
  },
  {
    title: "Backpack for Daily Use",
    category: "Other",
    price: 550,
    location: "Parking Area",
    college: "C.K. Pithawala College",
    year: "2nd Year",
    description: "Spacious college backpack with laptop sleeve and bottle pocket.",
    phone: "9876543214",
    imagePath: "/images/backpack.webp",
    demoSellerName: "Karan Mehta",
  },
];

async function seedDemoListings() {
  await connectDatabase();

  let demoUser = await User.findOne({ email: "demo@campuskart.local" });

  if (!demoUser) {
    demoUser = await User.create({
      username: "CampusKart Demo Seller",
      gender: "other",
      dob: new Date("2000-01-01"),
      email: "demo@campuskart.local",
      contact: "9876543200",
      passwordHash: await bcrypt.hash("demo12345", 10),
      enrollmentNo: "DEMO-001",
      college: "SDJ INTERNATIONAL COLLEGE",
      department: "BCA",
      semester: 5,
      passingYear: new Date().getFullYear() + 1,
      isVerified: true,
      idCardStatus: "verified",
    });
  }

  await Listing.deleteMany({ user: demoUser._id, title: { $in: demoListings.map((item) => item.title) } });

  await Listing.insertMany(
    demoListings.map((item, index) => ({
      ...item,
      user: demoUser._id,
      createdAt: new Date(Date.now() - index * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - index * 60 * 60 * 1000),
    }))
  );

  console.log("Demo listings seeded");
  process.exit(0);
}

seedDemoListings().catch((error) => {
  console.error("Failed to seed demo listings", error);
  process.exit(1);
});
