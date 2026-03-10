const router = require("express").Router();
const {menuitem, operatorMap, MenuItem} = require("../models/index");
const {authenticate} = require("../middleware/auth_middleware");
 
// Get all menuitems
router.get("/", async (_req, res) => {
  try {
    const menuitems = await menuitem.findAll();
    res.json(menuitems);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni az éttermeket" });
  }
});
 
// Get menuitem by UUID
router.get("/:id", async (req, res) => {
  try {
    const menuitem = await MenuItem.findByPk(req.params.id);
    if (menuitem) {
      res.json(menuitem);
    } else {
      res.status(404).json({ error: "Nem található ilyen étterem" });
    }
    } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni az éttermet" });
    }
});
// Create a new menuitem
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, description, address, phone } = req.body;
    const newmenuitem = await MenuItem.create({
      owner_id: req.user.id,
      name,
      description,
      address,
      phone
    });
    res.status(201).json(newmenuitem);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült létrehozni az éttermet" });
  }
});
// Update menuitem details
router.patch("/:id", authenticate, async (req, res) => {
    try {
        const menuitem = await MenuItem.findByPk(req.params.id);
        if (!menuitem) {
            return res.status(404).json({ error: "Nem található ilyen étterem" });
        }
        if (menuitem.owner_id !== req.user.id) {
            return res.status(403).json({ error: "Nincs jogosultságod módosítani ezt az éttermet" });
        }
        const { name, description, address, phone, is_active } = req.body;
        await menuitem.update({ name, description, address, phone, is_active });
        res.json(menuitem);
    } catch (error) {
        res.status(500).json({ error: "Nem sikerült módosítani az éttermet" });
    }
});
// Delete a menuitem
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const menuitem = await MenuItem.findByPk(req.params.id);
        if (!menuitem) {
            return res.status(404).json({ error: "Nem található ilyen étterem" });
        }
        if (menuitem.owner_id !== req.user.id) {
            return res.status(403).json({ error: "Nincs jogosultságod törölni ezt az éttermet" });
        }
        await menuitem.destroy();
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
        const menuitems = await MenuItem.findAll({
            where: {
                [field]: {
                    [operatorMap[op]]: op === 'like' ? `%${value}%` : value
                }
            }
        });
        res.json(menuitems);
    } catch (error) {
        res.status(500).json({ error: "Nem sikerült lekérdezni az éttermeket" });
    }
});
 
 
 
module.exports = router;