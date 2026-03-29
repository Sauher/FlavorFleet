const router = require("express").Router();
const {address, operatorMap, Address} = require("../models/index");
const {authenticate} = require("../middleware/auth_middleware");
 
// Get all addresses
router.get("/", async (_req, res) => {
  try {
    const addresses = await Address.findAll();
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni a címeket" });
  }
});
 
// Get address by UUID
router.get("/:id", async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id);
    if (address) {
      res.json(address);
    } else {
      res.status(404).json({ error: "Nem található ilyen cím" });
    }
    } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni a címet" });
    }
});
// Create a new address
router.post("/", authenticate, async (req, res) => {
  try {
    const { useraddress } = req.body;
    const newAddress = await Address.create({
      user_id: req.user.id,
      useraddress: useraddress
    });
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült létrehozni a címet" });
  }
});
// Update address details
router.patch("/:id", authenticate, async (req, res) => {
    try {
        const address = await Address.findByPk(req.params.id);
        if (!address) {
            return res.status(404).json({ error: "Nem található ilyen cím" });
        }
        if (address.user_id !== req.user.id) {
            return res.status(403).json({ error: "Nincs jogosultságod módosítani ezt a címet" });
        }
        const { useraddress } = req.body;
        await address.update({ useraddress });
        res.json(address);
    } catch (error) {
        res.status(500).json({ error: "Nem sikerült módosítani a címet" });
    }
});
// Delete an address
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const address = await Address.findByPk(req.params.id);
        if (!address) {
            return res.status(404).json({ error: "Nem található ilyen cím" });
        }
        if (address.user_id !== req.user.id) {
            return res.status(403).json({ error: "Nincs jogosultságod törölni ezt a címet" });
        }
        await address.destroy();
        res.json({ message: "Cím sikeresen törölve" });
    } catch (error) {
        res.status(500).json({ error: "Nem sikerült törölni a címet" });
    }
});
 
router.get("/:field/:op/:value", async (req, res) => {
    try {
        const { field, op, value } = req.params;
        if (!operatorMap[op]) {
            return res.status(400).json({ error: "Érvénytelen operátor" });
        }
        const addresses = await Address.findAll({
            where: {
                [field]: {
                    [operatorMap[op]]: op === 'like' ? `%${value}%` : value
                }
            }
        });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: "Nem sikerült lekérdezni a címeket" });
    }
});
 
 
 
module.exports = router;