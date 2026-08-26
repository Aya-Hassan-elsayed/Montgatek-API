
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
      name: "Beauty",
      icon: "fa fa-heart",
      color: "#ff7675"
    }

  ]);

  console.log(
    `${categories.length} categories created.`
  );


  // --------------------------------
  // 3. Category References
  // --------------------------------

  const electronicsCategory =
    categories.find(
      c => c.name === "Electronics"
    );

  const phonesCategory =
    categories.find(
      c => c.name === "Mobile Phones"
    );

  const computersCategory =
    categories.find(
      c => c.name === "Computers"
    );

  const fashionCategory =
    categories.find(
      c => c.name === "Fashion"
    );

  const watchesCategory =
    categories.find(
      c => c.name === "Watches"
    );

  const accessoriesCategory =
    categories.find(
      c => c.name === "Accessories"
    );

  const beautyCategory =
    categories.find(
      c => c.name === "Beauty"
    );


  // --------------------------------
  // 4. Uploads Path
  // --------------------------------

  const uploadsPath =
    path.join(
      __dirname,
      "public",
      "uploads"
    );


  // --------------------------------
  // 5. Read Images From Folder
  // --------------------------------

  function getImagesFromFolder(folderName) {

    const folderPath =
      path.join(
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
  // 6. Read Images
  // --------------------------------

  const smartImages =
    getImagesFromFolder("smart");

  const phoneImages =
    getImagesFromFolder("Mobile Phones");

  const laptopImages =
    getImagesFromFolder("laptops");

  const headphoneImages =
    getImagesFromFolder("headphones");

  const fashionImages =
    getImagesFromFolder("fashion");

  const watchImages =
    getImagesFromFolder("watches");

  const beautyImages =
    getImagesFromFolder("beauty");


  // --------------------------------
  // 7. Show Images Found
  // --------------------------------

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

  console.log(
    `Fashion: ${fashionImages.length}`
  );

  console.log(
    `Watches: ${watchImages.length}`
  );

  console.log(
    `Beauty: ${beautyImages.length}`
  );

  console.log("==============================");


  // --------------------------------
  // 8. Base URL
  // --------------------------------

  const BASE_URL =
    process.env.BASE_URL ||
    "http://localhost:3000";


  // --------------------------------
  // 9. Default Image
  // --------------------------------

  const defaultImageUrl =
    `${BASE_URL}/public/uploads/default.jpg`;


  // --------------------------------
  // 10. Create Image URL
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
    )}/${encodeURIComponent(
      imageName
    )}`;
  }


  // --------------------------------
  // 11. Create Products From Images
  // --------------------------------

  function createProductsFromImages(
    category,
    folderName,
    images,
    brand
  ) {

    // لو مفيش صور
    if (images.length === 0) {

      return [

        {

          name:
            `${category.name} Product`,

          description:
            `High quality ${category.name.toLowerCase()} product with modern design.`,

          richDescription:
            `This is a high quality ${category.name.toLowerCase()} product designed for everyday use.`,

          image:
            defaultImageUrl,

          images: [
            defaultImageUrl
          ],

          brand:
            brand,

          price:
            1500,

          discount:
            0,

          category:
            category._id,

          countInStock:
            10,

          rating:
            4,

          numReviews:
            0,

          isFeatured:
            true,

          color:
            "#000000"

        }

      ];
    }


    // كل صورة = Product
    return images.map(
      (imageName, index) => {

        const imageUrl =
          createImageUrl(
            folderName,
            imageName
          );

        return {

          name:
            `${category.name} Product ${index + 1}`,

          description:
            `High quality ${category.name.toLowerCase()} product with modern design.`,

          richDescription:
            `This is a high quality ${category.name.toLowerCase()} product designed for everyday use.`,

          image:
            imageUrl,

          images: [
            imageUrl
          ],

          brand:
            brand,

          price:
            1500 + (index * 1000),

          discount:
            0,

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
  // 12. Create Products
  // --------------------------------

  console.log("");
  console.log("Creating products...");

  const products = [];


  // ===============================
  // ELECTRONICS
  // ===============================

  products.push(

    ...createProductsFromImages(

      electronicsCategory,

      "smart",

      smartImages,

      "Sony"

    )

  );


  // ===============================
  // MOBILE PHONES
  // ===============================

  products.push(

    ...createProductsFromImages(

      phonesCategory,

      "Mobile Phones",

      phoneImages,

      "Samsung"

    )

  );


  // ===============================
  // COMPUTERS
  // ===============================

  products.push(

    ...createProductsFromImages(

      computersCategory,

      "laptops",

      laptopImages,

      "Lenovo"

    )

  );


  // ===============================
  // ACCESSORIES
  // ===============================

  products.push(

    ...createProductsFromImages(

      accessoriesCategory,

      "headphones",

      headphoneImages,

      "JBL"

    )

  );


  // ===============================
  // FASHION
  // ===============================

  products.push(

    ...createProductsFromImages(

      fashionCategory,

      "fashion",

      fashionImages,

      "Nike"

    )

  );


  // ===============================
  // WATCHES
  // ===============================

  products.push(

    ...createProductsFromImages(

      watchesCategory,

      "watches",

      watchImages,

      "Xiaomi"

    )

  );


  // ===============================
  // BEAUTY
  // ===============================

  products.push(

    ...createProductsFromImages(

      beautyCategory,

      "beauty",

      beautyImages,

      "Beauty"

    )

  );


  // --------------------------------
  // 13. Insert Products
  // --------------------------------

  const createdProducts =
    await Product.insertMany(
      products
    );

  console.log(
    `${createdProducts.length} products created.`
  );


  // --------------------------------
  // 14. Create Users
  // --------------------------------

  console.log("Creating users...");

  const users = [

    {
      firstName:
        "Admin",

      lastName:
        "User",

      email:
        "admin@eshop.com",

      passwordHash:
        "123456",

      isAdmin:
        true,

      phone:
        "01000000000",

      gender:
        "Male",

      nationality:
        "Egyptian"
    },


    {
      firstName:
        "Aya",

      lastName:
        "Hassan",

      email:
        "aya@eshop.com",

      passwordHash:
        "123456",

      isAdmin:
        false,

      phone:
        "01011111111",

      gender:
        "Female",

      nationality:
        "Egyptian"
    },


    {
      firstName:
        "Ahmed",

      lastName:
        "Ali",

      email:
        "ahmed@eshop.com",

      passwordHash:
        "123456",

      isAdmin:
        false,

      phone:
        "01022222222",

      gender:
        "Male",

      nationality:
        "Egyptian"
    },


    {
      firstName:
        "Sara",

      lastName:
        "Mohamed",

      email:
        "sara@eshop.com",

      passwordHash:
        "123456",

      isAdmin:
        false,

      phone:
        "01033333333",

      gender:
        "Female",

      nationality:
        "Egyptian"
    }

  ];


  const createdUsers =
    await User.insertMany(
      users
    );

  console.log(
    `${createdUsers.length} users created.`
  );


  // --------------------------------
  // 15. Summary
  // --------------------------------

  console.log("");

  console.log(
    "=============================="
  );

  console.log(
    "DATABASE SEEDED SUCCESSFULLY"
  );

  console.log(
    "=============================="
  );

  console.log(
    `Categories: ${categories.length}`
  );

  console.log(
    `Products:   ${createdProducts.length}`
  );

  console.log(
    `Users:      ${createdUsers.length}`
  );

  console.log(
    "=============================="
  );
}
