const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { MenuItem, Restaurant, operatorMap } = require("../models/index");
const { authenticate } = require("../middleware/auth_middleware");

const menuItemUploadsDir = path.join(process.cwd(), "uploads", "menuitems");
if (!fs.existsSync(menuItemUploadsDir)) {
  fs.mkdirSync(menuItemUploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, menuItemUploadsDir),
    filename: (_req, file, cb) => {
      const safeExt = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Csak képfájl tölthető fel"));
  },
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

/**
 * Middleware to verify that the authenticated user owns the restaurant
 * associated with the menu item operation
 */
async function verifyRestaurantOwnership(req, res, next) {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ error: "Nem található ilyen étel" });
    }

    const restaurant = await Restaurant.findByPk(menuItem.restaurant_id);
    
    if (!restaurant) {
      return res.status(404).json({ error: "Nem található az étterem" });
    }

    if (restaurant.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Nincs jogosultságod módosítani ezt az ételt" });
    }

    req.restaurant = restaurant;
    req.menuItem = menuItem;
    next();
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült ellenőrizni a jogosultságot" });
  }
}

/**
 * Middleware to verify that the authenticated user owns the target restaurant
 * (for menu item creation)
 */
async function verifyCreatePermission(req, res, next) {
  try {
    const { restaurant_id } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({ error: "Restaurant ID szükséges" });
    }

    const restaurant = await Restaurant.findByPk(restaurant_id);
    
    if (!restaurant) {
      return res.status(404).json({ error: "Nem található az étterem" });
    }

    if (restaurant.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Nincs jogosultságod ételt hozzáadni ehhez az étteremhez" });
    }

    req.restaurant = restaurant;
    next();
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült ellenőrizni a jogosultságot" });
  }
}

// Get all menu items (public)
router.get("/", async (_req, res) => {
  try {
    const menuItems = await MenuItem.findAll();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni az étel listát" });
  }
});

// Get menu items for a specific restaurant (public)
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // DEBUG: Log the restaurant ID being queried
    console.log(`[MenuItems] Fetching items for restaurant ID: ${restaurantId}`);

    const restaurant = await Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      console.log(`[MenuItems] Restaurant not found for ID: ${restaurantId}`);
      return res.status(404).json({ error: "Nem található az étterem" });
    }

    const menuItems = await MenuItem.findAll({
      where: { restaurant_id: restaurantId },
      order: [["createdAt", "DESC"]]
    });

    // DEBUG: Log the number of items found
    console.log(`[MenuItems] Found ${menuItems.length} items for restaurant ${restaurantId}`);
    
    res.json({ data: menuItems });
  } catch (error) {
    console.error(`[MenuItems] Error fetching menu items:`, error);
    res.status(500).json({ error: "Nem sikerült lekérdezni az ételt" });
  }
});

// Get menu item by ID
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id);
    if (menuItem) {
      res.json(menuItem);
    } else {
      res.status(404).json({ error: "Nem található ilyen étel" });
    }
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni az ételt" });
  }
});

// Upload menu item image to local storage
router.post("/upload/image", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nincs feltöltött kép" });
    }

    const { restaurant_id } = req.body;
    if (restaurant_id) {
      const restaurant = await Restaurant.findByPk(restaurant_id);
      if (!restaurant) {
        return res.status(404).json({ error: "Nem található az étterem" });
      }

      if (restaurant.owner_id !== req.user.id) {
        return res.status(403).json({ error: "Nincs jogosultságod képet feltölteni ehhez az étteremhez" });
      }
    }

    return res.status(201).json({
      imageURL: `/uploads/menuitems/${req.file.filename}`
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Nem sikerült feltölteni a képet" });
  }
});

// Create a new menu item
router.post("/", authenticate, verifyCreatePermission, async (req, res) => {
  try {
    const { restaurant_id, name, description, price, is_available, imageURL } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Az étel neve kötelező" });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ error: "Az ár 0-nál nagyobbnak kell lennie" });
    }

    const newMenuItem = await MenuItem.create({
      restaurant_id,
      name: name.trim(),
      description: description ? description.trim() : null,
      price,
      is_available: is_available !== undefined ? is_available : true,
      imageURL
    });

    res.status(201).json(newMenuItem);
  } catch (error) {
    res.status(400).json({ error: error.message || "Nem sikerült létrehozni az ételt" });
  }
});

// Update menu item
router.patch("/:id", authenticate, verifyRestaurantOwnership, async (req, res) => {
  try {
    const menuItem = req.menuItem;
    const { name, description, price, is_available, imageURL } = req.body;
    const updates = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ error: "Az étel neve kötelező" });
      }
      updates.name = trimmed;
    }

    if (description !== undefined) {
      updates.description = description ? String(description).trim() : null;
    }

    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({ error: "Az ár 0-nál nagyobbnak kell lennie" });
      }
      updates.price = price;
    }

    if (is_available !== undefined) {
      updates.is_available = is_available;
    }

    if (imageURL !== undefined) {
      updates.imageURL = imageURL;
    }

    await menuItem.update(updates);
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ error: error.message || "Nem sikerült módosítani az ételt" });
  }
});

// Delete menu item
router.delete("/:id", authenticate, verifyRestaurantOwnership, async (req, res) => {
  try {
    const menuItem = req.menuItem;
    await menuItem.destroy();
    res.json({ message: "Étel sikeresen törölve" });
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült törölni az ételt" });
  }
});

// Toggle availability
router.patch("/:id/toggle-availability", authenticate, verifyRestaurantOwnership, async (req, res) => {
  try {
    const menuItem = req.menuItem;
    menuItem.is_available = !menuItem.is_available;
    await menuItem.save();
    
    res.json({ is_available: menuItem.is_available });
  } catch (error) {
    res.status(400).json({ error: error.message || "Nem sikerült módosítani az ételt" });
  }
});

// Query by field
router.get("/:field/:op/:value", async (req, res) => {
  try {
    const { field, op, value } = req.params;
    
    if (!operatorMap[op]) {
      return res.status(400).json({ error: "Érvénytelen operátor" });
    }

    const menuItems = await MenuItem.findAll({
      where: {
        [field]: {
          [operatorMap[op]]: op === 'like' ? `%${value}%` : value
        }
      }
    });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni az ételeket" });
  }
});

module.exports = router;
