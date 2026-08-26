
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
  // 3. Category References
  // --------------------------------

  const electronicsCategory = categories.find(
    c => c.name === "Electronics"
  );

  const phonesCategory = categories.find(
    c => c.name === "Mobile Phones"
  );

  const computersCategory = categories.find(
    c => c.name === "Computers"
  );

  const fashionCategory = categories.find(
    c => c.name === "Fashion"
  );

  const watchesCategory = categories.find(
    c => c.name === "Watches"
  );

  const accessoriesCategory = categories.find(
    c => c.name === "Accessories"
  );

  const homeCategory = categories.find(
    c => c.name === "Home"
  );

  const beautyCategory = categories.find(
    c => c.name === "Beauty"
  );


  // --------------------------------
  // 4. Uploads Path
  // --------------------------------

  const uploadsPath = path.join(
    __dirname,
    "public",
    "uploads"
  );


  // --------------------------------
  // 5. Read Images From Category Folder
  // --------------------------------

  function getImagesFromFolder(folderName) {

    const folderPath = path.join(
      uploadsPath,
      folderName
    );

    if (!fs.existsSync(folderPath)) {

      console.log(
        `Folder not found: ${folderPath}`
      );

      return [];
    }

    return fs
      .readdirSync(folderPath)
      .filter(file => {

        const extension =
          path.extname(file).toLowerCase();

        return [
          ".jpg",
          ".jpeg",
          ".png",
          ".webp"
        ].includes(extension);

      });
  }


  // --------------------------------
  // 6. Read Current Images
  // --------------------------------

  const smartImages =
    getImagesFromFolder("smart");

  const phoneImages =
    getImagesFromFolder("Mobile Phones");

  const laptopImages =
    getImagesFromFolder("laptops");

  const headphoneImages =
    getImagesFromFolder("headphones");


  console.log("");
  console.log("==============================");
  console.log("IMAGES FOUND");
  console.log("==============================");

  console.log(
    `Electronics (smart): ${smartImages.length}`
  );

  console.log(
    `Mobile Phones: ${phoneImages.length}`
  );

  console.log(
    `Computers (laptops): ${laptopImages.length}`
  );

  console.log(
    `Accessories (headphones): ${headphoneImages.length}`
  );

  console.log("==============================");


  // --------------------------------
  // 7. Base URL
  // --------------------------------

  const BASE_URL =
    process.env.BASE_URL ||
    "http://localhost:3000";


  // --------------------------------
  // 8. Default Image
  // --------------------------------

  const defaultImageUrl =
    `${BASE_URL}/public/uploads/default.jpg`;


  // --------------------------------
  // 9. Create Image URL
  // --------------------------------

  function createImageUrl(
    folderName,
    imageName
  ) {

    if (!imageName) {
      return defaultImageUrl;
    }

    return `${BASE_URL}/public/uploads/${encodeURIComponent(
      folderName
    )}/${encodeURIComponent(imageName)}`;
  }


  // --------------------------------
  // 10. Create Products Helper
  // --------------------------------

  function createProductsForCategory(
    category,
    productsData,
    folderName,
    images
  ) {

    return productsData.map(
      (product, index) => {

        let imageUrl;

        // Category has real images
        if (images.length > 0) {

          const imageName =
            images[index % images.length];

          imageUrl = createImageUrl(
            folderName,
            imageName
          );

        }

        // Category has no images yet
        else {

          imageUrl = defaultImageUrl;

        }


        return {

          name: product.name,

          description:
            "High quality product with modern design.",

          richDescription:
            `This is a high quality ${product.name} designed for everyday use.`,

          image: imageUrl,

          images: [
            imageUrl
          ],

          brand: product.brand,

          price: product.price,

          discount:
            product.discount || 0,

          category:
            category._id,

          countInStock:
            10 + index,

          rating:
            3 + ((index % 3) * 0.5),

          numReviews:
            index * 2,

          isFeatured:
            index < 5,

          color:
            [
              "#000000",
              "#ffffff",
              "#3498db",
              "#e74c3c",
              "#2ecc71"
            ][index % 5]
        };

      }
    );
  }


  // --------------------------------
  // 11. Create Products
  // --------------------------------

  console.log("");
  console.log("Creating products...");

  const products = [];


  // ===============================
  // ELECTRONICS
  // ===============================

  products.push(
    ...createProductsForCategory(

      electronicsCategory,

      [
        {
          name: "Smart Speaker",
          brand: "Sony",
          price: 2500
        },
        {
          name: "Bluetooth Speaker",
          brand: "JBL",
          price: 3200
        },
        {
          name: "Digital Camera",
          brand: "Sony",
          price: 7500
        },
        {
          name: "Smart Device",
          brand: "Xiaomi",
          price: 1800
        }
      ],

      "smart",

      smartImages
    )
  );


  // ===============================
  // MOBILE PHONES
  // ===============================

  products.push(
    ...createProductsForCategory(

      phonesCategory,

      [
        {
          name: "iPhone Smartphone",
          brand: "Apple",
          price: 25000
        },
        {
          name: "Samsung Galaxy",
          brand: "Samsung",
          price: 18000
        },
        {
          name: "Xiaomi Smartphone",
          brand: "Xiaomi",
          price: 9000
        },
        {
          name: "Premium Smartphone",
          brand: "Samsung",
          price: 15000
        }
      ],

      "Mobile Phones",

      phoneImages
    )
  );


  // ===============================
  // COMPUTERS
  // ===============================

  products.push(
    ...createProductsForCategory(

      computersCategory,

      [
        {
          name: "Gaming Laptop",
          brand: "Lenovo",
          price: 35000
        },
        {
          name: "Laptop Pro",
          brand: "Lenovo",
          price: 42000
        },
        {
          name: "Business Laptop",
          brand: "Dell",
          price: 30000
        },
        {
          name: "Professional Laptop",
          brand: "HP",
          price: 38000
        }
      ],

      "laptops",

      laptopImages
    )
  );


  // ===============================
  // ACCESSORIES
  // ===============================

  products.push(
    ...createProductsForCategory(

      accessoriesCategory,

      [
        {
          name: "Wireless Headphones",
          brand: "Sony",
          price: 4500
        },
        {
          name: "Bluetooth Headphones",
          brand: "JBL",
          price: 3500
        },
        {
          name: "Gaming Headset",
          brand: "Sony",
          price: 5000
        },
        {
          name: "Premium Headphones",
          brand: "JBL",
          price: 6000
        }
      ],

      "headphones",

      headphoneImages
    )
  );


  // ===============================
  // FASHION
  // ===============================

  products.push(
    ...createProductsForCategory(

      fashionCategory,

      [
        {
          name: "Fashion Bag",
          brand: "Nike",
          price: 2500
        },
        {
          name: "Running Shoes",
          brand: "Nike",
          price: 3000
        }
      ],

      "",

      []
    )
  );


  // ===============================
  // WATCHES
  // ===============================

  products.push(
    ...createProductsForCategory(

      watchesCategory,

      [
        {
          name: "Smart Watch",
          brand: "Xiaomi",
          price: 5000
        },
        {
          name: "Classic Watch",
          brand: "Sony",
          price: 3500
        }
      ],

      "",

      []
    )
  );


  // ===============================
  // HOME
  // ===============================

  products.push(
    ...createProductsForCategory(

      homeCategory,

      [
        {
          name: "Home Speaker",
          brand: "JBL",
          price: 2800
        },
        {
          name: "Home Device",
          brand: "Xiaomi",
          price: 2200
        }
      ],

      "",

      []
    )
  );


  // ===============================
  // BEAUTY
  // ===============================

  products.push(
    ...createProductsForCategory(

      beautyCategory,

      [
        {
          name: "Beauty Product",
          brand: "Sony",
          price: 1500
        },
        {
          name: "Beauty Kit",
          brand: "Xiaomi",
          price: 2000
        }
      ],

      "",

      []
    )
  );


  // --------------------------------
  // 12. Insert Products
  // --------------------------------

  const createdProducts =
    await Product.insertMany(products);

  console.log(
    `${createdProducts.length} products created.`
  );


  // --------------------------------
  // 13. Create Users
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
  // 14. Summary
  // --------------------------------

  console.log("");

  console.log("==============================");
  console.log("DATABASE SEEDED SUCCESSFULLY");
  console.log("==============================");

  console.log(
    `Categories: ${categories.length}`
  );

  console.log(
    `Products:   ${createdProducts.length}`
  );

  console.log(
    `Users:      ${createdUsers.length}`
  );

  console.log("==============================");
}

