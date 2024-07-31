const express = require("express");
const { connection } = require("./db");
const { UserModel } = require("./models/user");
const { ProductModel } = require("./models/product");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to User-Product-Management");
});

// Creating a new user 
app.post('/users', async (req, res) => {
    const data = req.body;
    try {
        if (Array.isArray(data)) {
            // Validate and process each user
            const validUsers = [];
            const existingEmails = [];

            for (let user of data) {
                if (!user.name || !user.email || !user.age) {
                    throw new Error('Missing required user fields');
                }

                // Check for existing user with the same email
                const existingUser = await UserModel.findOne({ email: user.email });
                if (existingUser) {
                    existingEmails.push(user.email);
                } else {
                    validUsers.push(user);
                }
            }

            // If there are valid users, insert them
            if (validUsers.length > 0) {
                await UserModel.insertMany(validUsers);
            }

            if (existingEmails.length > 0) {
                return res.status(409).send(`Users with these emails already exist: ${existingEmails.join(', ')}`);
            }

            res.status(201).send('Users created successfully');
        } else {
            if (!data.name || !data.email || !data.age) {
                throw new Error('Missing required user fields');
            }

            // Check for existing user with the same email
            const existingUser = await UserModel.findOne({ email: data.email });
            if (existingUser) {
                return res.status(409).send('User with this email already exists');
            }

            const user = new UserModel(data);
            await user.save();
            res.status(201).send('User created successfully');
        }
    } catch (err) {
        res.status(500).send(`Error creating users: ${err.message}`);
        console.log(err);
    }
});

// Read all users
app.get('/users', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send('Error fetching users');
        console.log(err);
    }
});

// Update user by ID
app.patch('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const payload = req.body;
    try {
        await UserModel.findByIdAndUpdate(userId, payload);
        res.send('User updated successfully');
    } catch (err) {
        res.status(500).send('Error updating user');
        console.log(err);
    }
});

// Delete user by ID
app.delete('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await UserModel.findByIdAndDelete(userId);
        res.send('User deleted successfully');
    } catch (err) {
        res.status(500).send('Error deleting user');
        console.log(err);
    }
});

// Creating a new product 
app.post('/products', async (req, res) => {
    const data = req.body;
    try {
        if (Array.isArray(data)) {
            // Validate each product object
            data.forEach(product => {
                if (!product.name || !product.price || !product.category || !product.stock) {
                    throw new Error('Missing required product fields');
                }
            });
            await ProductModel.insertMany(data);
        } else {
            if (!data.name || !data.price || !data.category || !data.stock) {
                throw new Error('Missing required product fields');
            }
            const product = new ProductModel(data);
            await product.save();
        }
        res.status(201).send('Products created successfully');
    } catch (err) {
        res.status(500).send(`Error creating products: ${err.message}`);
        console.log(err);
    }
});

// Read all products
app.get('/products', async (req, res) => {
    try {
        const products = await ProductModel.find();
        res.status(200).send(products);
    } catch (err) {
        res.status(500).send('Error fetching products');
        console.log(err);
    }
});

// Update product by ID
app.patch('/products/:productId', async (req, res) => {
    const { productId } = req.params;
    const payload = req.body;
    try {
        await ProductModel.findByIdAndUpdate(productId, payload);
        res.send('Product updated successfully');
    } catch (err) {
        res.status(500).send('Error updating product');
        console.log(err);
    }
});

// Delete product by ID
app.delete('/products/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        await ProductModel.findByIdAndDelete(productId);
        res.send('Product deleted successfully');
    } catch (err) {
        res.status(500).send('Error deleting product');
        console.log(err);
    }
});

// Start the server and connect to the database
app.listen(3001, async () => {
    try {
        await connection;
        console.log("Connected to db");
    } catch (err) {
        console.log(err);
    }
    console.log("Server running on port 3001");
});
