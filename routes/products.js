const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }

        cb(uploadError, 'public/uploads');
    },

    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];

        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });


// =====================================================
// Helper: Get correct online image URL
// =====================================================

const getImageBaseUrl = (req) => {
    return `${req.protocol}://${req.get('host')}/public/uploads/`;
};


// =====================================================
// Helper: Convert old localhost image URL to online URL
// =====================================================

const fixImageUrl = (image, req) => {

    if (!image) {
        return image;
    }

    const onlineBaseUrl = getImageBaseUrl(req);

    // Old localhost URL
    if (image.includes('http://localhost:3000/public/uploads/')) {
        return image.replace(
            'http://localhost:3000/public/uploads/',
            onlineBaseUrl
        );
    }

    // Old localhost URL with 127.0.0.1
    if (image.includes('http://127.0.0.1:3000/public/uploads/')) {
        return image.replace(
            'http://127.0.0.1:3000/public/uploads/',
            onlineBaseUrl
        );
    }

    return image;
};


// =====================================================
// GET ALL PRODUCTS
// =====================================================

router.get(`/`, async (req, res) => {

    console.log(req.query.categories);

    let filter = {};

    if (req.query.categories) {
        filter = {
            category: req.query.categories.split(',')
        };
    }

    console.log(filter);

    const productList = await Product
        .find(filter)
        .populate('category');

    if (!productList) {
        return res.status(500).json({
            success: false
        });
    }

    // Fix old image URLs
    const fixedProducts = productList.map(product => {

        const productObject = product.toObject();

        productObject.image = fixImageUrl(
            productObject.image,
            req
        );

        if (productObject.images && Array.isArray(productObject.images)) {
            productObject.images = productObject.images.map(image =>
                fixImageUrl(image, req)
            );
        }

        return productObject;
    });

    res.send(fixedProducts);
});


// =====================================================
// GET PRODUCT BY ID
// =====================================================

router.get(`/:id`, async (req, res) => {

    const product = await Product
        .findById(req.params.id)
        .populate('category');

    if (!product) {
        return res.status(500).json({
            success: false
        });
    }

    const productObject = product.toObject();

    productObject.image = fixImageUrl(
        productObject.image,
        req
    );

    if (productObject.images && Array.isArray(productObject.images)) {
        productObject.images = productObject.images.map(image =>
            fixImageUrl(image, req)
        );
    }

    res.send(productObject);
});


// =====================================================
// ADD PRODUCT
// =====================================================

router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    const category = await Category.findById(req.body.category);

    if (!category) {
        return res.status(400).send('Invalid Category');
    }

    const file = req.file;

    if (!file) {
        return res.status(400).send('No image in the request');
    }

    const fileName = file.filename;

    const basePath = getImageBaseUrl(req);

    let product = new Product({

        name: req.body.name,

        description: req.body.description,

        richDescription: req.body.richDescription,

        image: `${basePath}${fileName}`,

        brand: req.body.brand,

        price: req.body.price,

        discount: req.body.discount,

        category: req.body.category,

        countInStock: req.body.countInStock,

        rating: req.body.rating,

        numReviews: req.body.numReviews,

        isFeatured: req.body.isFeatured,

        color: req.body.color
    });

    product = await product.save();

    if (!product) {
        return res.status(500).send(
            'The product cannot be created'
        );
    }

    res.send(product);
});


// =====================================================
// UPDATE PRODUCT
// =====================================================

router.put('/:id', uploadOptions.single('image'), async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }

    const category = await Category.findById(req.body.category);

    if (!category) {
        return res.status(400).send('Invalid Category');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(400).send('Invalid Product!');
    }

    let imagepath;

    if (req.body.imageChanged && req.file) {

        const file = req.file;

        const fileName = file.filename;

        const basePath = getImageBaseUrl(req);

        imagepath = `${basePath}${fileName}`;

    } else {

        imagepath = product.image;
    }


    const updatedProduct = await Product.findByIdAndUpdate(

        req.params.id,

        {
            name: req.body.name,

            description: req.body.description,

            richDescription: req.body.richDescription,

            image: imagepath,

            brand: req.body.brand,

            price: req.body.price,

            discount: req.body.discount,

            category: req.body.category,

            countInStock: req.body.countInStock,

            rating: req.body.rating,

            numReviews: req.body.numReviews,

            isFeatured: req.body.isFeatured,

            color: req.body.color
        },

        {
            new: true
        }
    );

    if (!updatedProduct) {
        return res.status(500).send(
            'the product cannot be updated!'
        );
    }

    res.send(updatedProduct);
});


// =====================================================
// DELETE PRODUCT
// =====================================================

router.delete('/:id', (req, res) => {

    Product.findByIdAndRemove(req.params.id)

        .then((product) => {

            if (product) {

                return res.status(200).json({

                    success: true,

                    message: 'the product is deleted!'
                });

            } else {

                return res.status(404).json({

                    success: false,

                    message: 'product not found!'
                });
            }
        })

        .catch((err) => {

            return res.status(500).json({

                success: false,

                error: err
            });
        });
});


// =====================================================
// PRODUCT COUNT
// =====================================================

router.get(`/get/count`, async (req, res) => {

    const productCount = await Product.countDocuments();

    if (!productCount) {

        return res.status(500).json({
            success: false
        });
    }

    res.send({
        productCount: productCount
    });
});


// =====================================================
// FEATURED PRODUCTS
// =====================================================

router.get(`/get/featured/:count`, async (req, res) => {

    const count = req.params.count
        ? req.params.count
        : 0;

    const products = await Product
        .find({
            isFeatured: true
        })
        .limit(+count);

    if (!products) {

        return res.status(500).json({
            success: false
        });
    }

    const fixedProducts = products.map(product => {

        const productObject = product.toObject();

        productObject.image = fixImageUrl(
            productObject.image,
            req
        );

        if (
            productObject.images &&
            Array.isArray(productObject.images)
        ) {

            productObject.images =
                productObject.images.map(image =>
                    fixImageUrl(image, req)
                );
        }

        return productObject;
    });

    res.send(fixedProducts);
});


// =====================================================
// GALLERY IMAGES
// =====================================================

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {

        if (!mongoose.isValidObjectId(req.params.id)) {

            return res.status(400).send(
                'Invalid Product Id'
            );
        }

        const files = req.files;

        let imagesPaths = [];

        const basePath = getImageBaseUrl(req);

        if (files) {

            files.map((file) => {

                imagesPaths.push(
                    `${basePath}${file.filename}`
                );

            });
        }

        const product =
            await Product.findByIdAndUpdate(

                req.params.id,

                {
                    images: imagesPaths
                },

                {
                    new: true
                }
            );

        if (!product) {

            return res.status(500).send(
                'the gallery cannot be updated!'
            );
        }

        res.send(product);
    }
);


module.exports = router;