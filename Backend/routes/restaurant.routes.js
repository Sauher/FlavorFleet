const router = require("express").Router();
const {Restaurant, operatorMap} = require("../models/index");
const {authenticate} = require("../middleware/auth_middleware");

// Get all restaurants
router.get("/", async (_req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni az éttermeket" });
  }
});

// Get restaurant by UUID
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ error: "Nem található ilyen étterem" });
    }
    } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni az éttermet" });
    }
});
// Create a new restaurant
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, description, address, phone } = req.body;
    const newRestaurant = await Restaurant.create({
      owner_id: req.user.id,
      name,
      description,
      address,
      phone
    });
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült létrehozni az éttermet" });
  }
});
// Update restaurant details
router.patch("/:id", authenticate, async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: "Nem található ilyen étterem" });
        }
        if (restaurant.owner_id !== req.user.id) {
            return res.status(403).json({ error: "Nincs jogosultságod módosítani ezt az éttermet" });
        }
        const { name, description, address, phone, is_active } = req.body;
        await restaurant.update({ name, description, address, phone, is_active });
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: "Nem sikerült módosítani az éttermet" });
    }
});
// Delete a restaurant
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.id);    
        if (!restaurant) {
            return res.status(404).json({ error: "Nem található ilyen étterem" });
        }
        if (restaurant.owner_id !== req.user.id) {
            return res.status(403).json({ error: "Nincs jogosultságod törölni ezt az éttermet" });
        }
        await restaurant.destroy();
        res.json({ message: "Étterm sikeresen törölve" });
    } catch (error) {
        res.status(500).json({ error: "Nem sikerült törölni az éttermet" });
    }
});

router.get("/:field/:op/:value", async (req, res) => {
    try {
        const { field, op, value } = req.params;
        if (!operatorMap[op]) {
            return res.status(400).json({ error: "Érvénytelen operátor" });
        }
        const restaurants = await Restaurant.findAll({
            where: {
                [field]: {
                    [operatorMap[op]]: op === 'like' ? `%${value}%` : value
                }
            }
        });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: "Nem sikerült lekérdezni az éttermeket" });
    }
});



module.exports = router;
