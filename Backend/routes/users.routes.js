const router = require("express").Router();
const bcrypt = require("bcrypt");
const {User, operatorMap} = require("../models/index");
const {generateToken,authenticate} = require("../middleware/auth_middleware");

router.get("/",authenticate, async (req, res) => {
    User.findAll()
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

router.get("/:id",authenticate, async (req, res) => {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

router.get("/:field/:op/:value", async (req, res) => {
    try{
        const { field, op, value } = req.params;
        
        if (!operatorMap[op]) {
            return res.status(400).json({ error: "Invalid operator" });
        }
        const where = {
            [field]: {
                [operatorMap[op]]: op === 'lk' ? `%${value}%` : value
            }
        }
        const user = await User.findAll({ where });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.scope("withPassword").findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "No user found" });
        }
        if(!user.status) {
            return res.status(403).json({ message: "User is inactive" });
        }
        if (user && await bcrypt.compare(password, user.password)) {
            await user.update({ lastLogin: new Date() });

            const token = generateToken(user);
            res.status(200).json({ token, id: user.id });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/registration", async (req, res) => {
    try{
    const { name, email, password} = req.body;

    if (await User.findOne({ where: { email } })) {
        return res.status(400).json({ message: "Email already in use" });
    }
    const user =  await User.create({ name, email, password});
    res.status(201).json({ user ,message: "User registered successfully" });
    } catch(e){
        res.status(500).json({ message: 'Registration failed', error: e.message });
    }
    
});

router.patch("/:id",authenticate, async (req, res) => {
const id = req.params.id;
const user = await User.findByPk(id);
if (!user){
    return  res.status(404).json({ message: "User not found" });
}
const updateduser = await user.update(req.body);
res.status(200).json(updateduser);
});


router.delete("/:id",authenticate, async (req, res) => {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
});

module.exports = router;