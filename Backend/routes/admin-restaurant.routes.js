const router = require("express").Router();
const { Restaurant, User } = require("../models/index");
const { authenticate } = require("../middleware/auth_middleware");
const { adminAuthorization } = require("../middleware/admin_middleware");
const { Op } = require("sequelize");

/**
 * GET /api/admin/restaurants
 * Get all restaurants with owner details
 * Accessible only by admins
 */
router.get("/", [authenticate, adminAuthorization], async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      attributes: [
        "id",
        "name",
        "description",
        "address",
        "phone",
        "image_url",
        "is_active",
        "is_open",
        "opening_hours",
        "images",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email", "status"],
          required: true
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants",
      error: error.message
    });
  }
});

/**
 * GET /api/admin/restaurants/:id
 * Get a specific restaurant with owner details
 */
router.get("/:id", [authenticate, adminAuthorization], async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      attributes: [
        "id",
        "name",
        "description",
        "address",
        "phone",
        "image_url",
        "is_active",
        "is_open",
        "opening_hours",
        "images",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email", "status"],
          required: true
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant",
      error: error.message
    });
  }
});

/**
 * PATCH /api/admin/restaurants/:id/toggle-status
 * Toggle the is_active field for a restaurant
 */
router.patch(
  "/:id/toggle-status",
  [authenticate, adminAuthorization],
  async (req, res) => {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findByPk(id);

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found"
        });
      }

      const newStatus = !restaurant.is_active;
      restaurant.is_active = newStatus;
      await restaurant.save();

      return res.status(200).json({
        success: true,
        message: `Restaurant ${newStatus ? "activated" : "deactivated"} successfully`,
        data: {
          id: restaurant.id,
          name: restaurant.name,
          is_active: restaurant.is_active
        }
      });
    } catch (error) {
      console.error("Error toggling restaurant status:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to toggle restaurant status",
        error: error.message
      });
    }
  }
);

/**
 * PUT /api/admin/restaurants/:id
 * Edit any restaurant field
 */
router.put("/:id", [authenticate, adminAuthorization], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      address,
      phone,
      image_url,
      is_active,
      opening_hours
    } = req.body;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Update allowed fields
    if (name !== undefined && typeof name === "string") {
      restaurant.name = name.trim();
    }

    if (description !== undefined && typeof description === "string") {
      restaurant.description = description.trim();
    }

    if (address !== undefined && typeof address === "string") {
      restaurant.address = address.trim();
    }

    if (phone !== undefined && typeof phone === "string") {
      restaurant.phone = phone.trim();
    }

    if (image_url !== undefined && typeof image_url === "string") {
      restaurant.image_url = image_url.trim();
    }

    if (is_active !== undefined && typeof is_active === "boolean") {
      restaurant.is_active = is_active;
    }

    if (opening_hours !== undefined && Array.isArray(opening_hours)) {
      // Validate opening hours structure (basic validation)
      const isValid = opening_hours.every(
        (entry) =>
          typeof entry === "object" &&
          "day" in entry &&
          (entry.opening_time === null || typeof entry.opening_time === "string") &&
          (entry.closing_time === null || typeof entry.closing_time === "string")
      );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid opening_hours format"
        });
      }

      restaurant.opening_hours = opening_hours;
    }

    await restaurant.save();

    // Fetch the updated restaurant with owner details
    const updatedRestaurant = await Restaurant.findByPk(id, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email", "status"]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: updatedRestaurant
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update restaurant",
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin/restaurants/:id
 * Soft delete or hard delete a restaurant (admin only)
 */
router.delete("/:id", [authenticate, adminAuthorization], async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Soft delete: set is_active to false
    restaurant.is_active = false;
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
      data: {
        id: restaurant.id,
        name: restaurant.name,
        is_active: restaurant.is_active
      }
    });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete restaurant",
      error: error.message
    });
  }
});

module.exports = router;
