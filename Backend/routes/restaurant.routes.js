const router = require("express").Router();
const {Restaurant, operatorMap} = require("../models/index");
const {authenticate} = require("../middleware/auth_middleware");

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const IMAGE_DATA_URL_REGEX = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;
const IMAGE_PATH_REGEX = /^(\/uploads\/|https?:\/\/)/i;

function normalizeOpeningHours(openingHours) {
  if (!Array.isArray(openingHours) || openingHours.length !== 7) {
    throw new Error("A nyitvatartásnak 7 napot kell tartalmaznia (0-6)");
  }

  const normalized = openingHours.map((entry) => {
    const day = Number(entry?.day);
    const openingTime = entry?.opening_time ?? null;
    const closingTime = entry?.closing_time ?? null;

    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw new Error("Minden naphoz 0-6 közötti day érték szükséges");
    }

    const hasOnlyOneTime = (openingTime && !closingTime) || (!openingTime && closingTime);
    if (hasOnlyOneTime) {
      throw new Error("A nyitási és zárási időt együtt kell megadni");
    }

    if (openingTime && !TIME_REGEX.test(openingTime)) {
      throw new Error("Érvénytelen nyitási idő formátum, elvárt: HH:mm");
    }

    if (closingTime && !TIME_REGEX.test(closingTime)) {
      throw new Error("Érvénytelen zárási idő formátum, elvárt: HH:mm");
    }

    return {
      day,
      opening_time: openingTime,
      closing_time: closingTime
    };
  });

  const uniqueDays = new Set(normalized.map((entry) => entry.day));
  if (uniqueDays.size !== 7) {
    throw new Error("A nyitvatartásban minden napnak egyszer kell szerepelnie (0-6)");
  }

  return normalized.sort((a, b) => a.day - b.day);
}

function normalizeImages(images) {
  if (images === undefined) {
    return undefined;
  }

  if (!Array.isArray(images)) {
    throw new Error("A képek mező tömb kell legyen");
  }

  const normalizedImages = images
    .filter((image) => typeof image === "string")
    .map((image) => image.trim())
    .filter((image) => image.length > 0);

  if (normalizedImages.length > 2) {
    throw new Error("Maximum 2 kép tölthető fel");
  }

  for (const image of normalizedImages) {
    const isDataUrl = IMAGE_DATA_URL_REGEX.test(image);
    const isImagePath = IMAGE_PATH_REGEX.test(image);
    if (!isDataUrl && !isImagePath) {
      throw new Error("A képek csak Base64 data URL vagy /uploads elérési út formátumban lehetnek");
    }
  }

  return normalizedImages;
}

function validateCreatePayload(payload) {
  const name = typeof payload?.name === "string" ? payload.name.trim() : "";
  const address = typeof payload?.address === "string" ? payload.address.trim() : "";

  if (!name) {
    throw new Error("A név megadása kötelező");
  }

  if (!address) {
    throw new Error("A cím megadása kötelező");
  }

  return { name, address };
}

// Get all restaurants
router.get("/", async (_req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni az éttermeket" });
  }
});

// Get all restaurants for authenticated owner
router.get("/owner/mine", authenticate, async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { owner_id: req.user.id },
      order: [["createdAt", "DESC"]]
    });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni a saját éttermeket" });
  }
});

// Get owner restaurant by UUID
router.get("/owner/:id", authenticate, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: {
        id: req.params.id,
        owner_id: req.user.id
      }
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Nem található ilyen étterem" });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült lekérdezni az éttermet" });
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
    const { name, address } = validateCreatePayload(req.body);

    const {
      description,
      image_url,
      phone,
      is_active,
      is_open,
      opening_hours,
      images
    } = req.body;

    const normalizedOpeningHours = opening_hours
      ? normalizeOpeningHours(opening_hours)
      : undefined;
    const normalizedImages = normalizeImages(images);

    const newRestaurant = await Restaurant.create({
      owner_id: req.user.id,
      name,
      description,
      address,
      image_url,
      phone,
      is_active,
      is_open,
      opening_hours: normalizedOpeningHours,
      images: normalizedImages
    });

    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(400).json({ error: error.message || "Nem sikerült létrehozni az éttermet" });
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
        const { name, description, address, image_url, phone, is_active, is_open, opening_hours, images } = req.body;

        const updates = {};

        if (name !== undefined) updates.name = String(name).trim();
        if (description !== undefined) updates.description = description;
        if (address !== undefined) updates.address = String(address).trim();
        if (image_url !== undefined) updates.image_url = image_url;
        if (phone !== undefined) updates.phone = phone;
        if (is_active !== undefined) updates.is_active = is_active;
        if (is_open !== undefined) updates.is_open = is_open;
        if (opening_hours !== undefined) updates.opening_hours = normalizeOpeningHours(opening_hours);

        if (updates.name !== undefined && !updates.name) {
          return res.status(400).json({ error: "A név megadása kötelező" });
        }

        if (updates.address !== undefined && !updates.address) {
          return res.status(400).json({ error: "A cím megadása kötelező" });
        }

        const normalizedImages = normalizeImages(images);
        if (normalizedImages !== undefined) {
          updates.images = normalizedImages;
        }

        await restaurant.update(updates);
        res.json(restaurant);
    } catch (error) {
        res.status(400).json({ error: error.message || "Nem sikerült módosítani az éttermet" });
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
