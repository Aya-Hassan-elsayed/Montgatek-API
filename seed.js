const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv/config");

const { Category } = require("./models/category");
const { Product } = require("./models/product");
const { User } = require("./models/user");

// ===============================
// MongoDB Connection
// ===============================

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "mean-eshop",
  })
  .then(async () => {
    console.log("Database Connection is ready...");

    try {
      await seedDatabase();
      console.log("Seed completed successfully!");
    } catch (error) {
      console.error("Seed Error:", error);
    } finally {
      await mongoose.disconnect();
      console.log("Database connection closed.");
    }
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });


// ===============================
// Seed Function
// ===============================

async function seedDatabase() {

  // --------------------------------
  // 1. Clear old data
  // --------------------------------

  console.log("Clearing old Categories, Products and Users...");

  await Category.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({});


  // --------------------------------
  // 2. Create Categories
  // --------------------------------

  console.log("Creating categories...");

  const categories = await Category.insertMany([
    {
      name: "Electronics",
      icon: "fa fa-laptop",
      color: "#3498db"
    },
    {
      name: "Mobile Phones",
      icon: "fa fa-mobile",
      color: "#9b59b6"
    },
    {
      name: "Computers",
      icon: "fa fa-desktop",
      color: "#34495e"
    },
    {
      name: "Fashion",
      icon: "fa fa-shopping-bag",
      color: "#e91e63"
    },
    {
      name: "Watches",
      icon: "fa fa-clock",
      color: "#f39c12"
    },
    {
      name: "Accessories",
      icon: "fa fa-headphones",
      color: "#1abc9c"
    },
    {
      name: "Home",
      icon: "fa fa-home",
      color: "#2ecc71"
    },
    {
      name: "Beauty",
      icon: "fa fa-heart",
      color: "#ff7675"
    }
  ]);

  console.log(`${categories.length} categories created.`);


  // --------------------------------
  // 3. Read Images Automatically
  // --------------------------------

  const uploadsPath = path.join(__dirname, "public", "uploads");

  let images = [];

  if (fs.existsSync(uploadsPath)) {

    images = fs
      .readdirSync(uploadsPath)
      .filter((file) => {
        const extension = path.extname(file).toLowerCase();

        return [
          ".jpg",
          ".jpeg",
          ".png"
        ].includes(extension);
      });

  }

  console.log(`${images.length} images found.`);


  // If no images exist
  if (images.length === 0) {

    console.log(
      "WARNING: No images found in public/uploads."
    );

    // We can still create products
    images = ["default.jpg"];
  }


  // --------------------------------
  // 4. Create Products
  // --------------------------------

  console.log("Creating products...");

  const productNames = [
    "Smart Phone",
    "Premium Smartphone",
    "Wireless Headphones",
    "Bluetooth Speaker",
    "Gaming Laptop",
    "Laptop Pro",
    "Smart Watch",
    "Classic Watch",
    "Fashion Bag",
    "Running Shoes",
    "Wireless Mouse",
    "Mechanical Keyboard",
    "Power Bank",
    "USB Cable",
    "Phone Charger",
    "Tablet",
    "Digital Camera",
    "Gaming Headset",
    "Sunglasses",
    "Home Speaker"
  ];

  const descriptions = [
    "High quality product with modern design.",
    "Premium product with excellent performance.",
    "Modern design and reliable performance.",
    "Perfect choice for everyday use."
  ];


  const products = [];


  for (let i = 0; i < productNames.length; i++) {

    const category = categories[i % categories.length];

    const imageName = images[i % images.length];

    const imageUrl =
      `http://localhost:3000/public/uploads/${encodeURIComponent(imageName)}`;


    products.push({

      name: productNames[i],

      description:
        descriptions[i % descriptions.length],

      richDescription:
        `This is a high quality ${productNames[i]} designed for everyday use.`,

      image: imageUrl,

      images: [
        imageUrl
      ],

      brand:
        ["Apple", "Samsung", "Sony", "Nike", "Lenovo", "Xiaomi"][
          i % 6
        ],

      price:
        500 + (i * 350),

      discount:
        i % 4 === 0 ? 10 : 0,

      category:
        category._id,

      countInStock:
        10 + (i % 20),

      rating:
        3 + ((i % 3) * 0.5),

      numReviews:
        i * 2,

      isFeatured:
        i < 8,

      color:
        ["#000000", "#ffffff", "#3498db", "#e74c3c", "#2ecc71"][
          i % 5
        ]

    });
  }


  const createdProducts =
    await Product.insertMany(products);

  console.log(
    `${createdProducts.length} products created.`
  );


  // --------------------------------
  // 5. Create Users
  // --------------------------------

  console.log("Creating users...");


  const users = [

    {
      firstName: "Admin",
      lastName: "User",
      email: "admin@eshop.com",
      passwordHash: "123456",
      isAdmin: true,
      phone: "01000000000",
      gender: "Male",
      nationality: "Egyptian"
    },

    {
      firstName: "Aya",
      lastName: "Hassan",
      email: "aya@eshop.com",
      passwordHash: "123456",
      isAdmin: false,
      phone: "01011111111",
      gender: "Female",
      nationality: "Egyptian"
    },

    {
      firstName: "Ahmed",
      lastName: "Ali",
      email: "ahmed@eshop.com",
      passwordHash: "123456",
      isAdmin: false,
      phone: "01022222222",
      gender: "Male",
      nationality: "Egyptian"
    },

    {
      firstName: "Sara",
      lastName: "Mohamed",
      email: "sara@eshop.com",
      passwordHash: "123456",
      isAdmin: false,
      phone: "01033333333",
      gender: "Female",
      nationality: "Egyptian"
    }

  ];


  const createdUsers =
    await User.insertMany(users);

  console.log(
    `${createdUsers.length} users created.`
  );


  // --------------------------------
  // 6. Summary
  // --------------------------------

  console.log("");
  console.log("==============================");
  console.log("DATABASE SEEDED SUCCESSFULLY");
  console.log("==============================");
  console.log(`Categories: ${categories.length}`);
  console.log(`Products:   ${createdProducts.length}`);
  console.log(`Users:      ${createdUsers.length}`);
  console.log("==============================");
}