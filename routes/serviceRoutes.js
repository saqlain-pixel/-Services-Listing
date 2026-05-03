const express = require("express");
const router = express.Router();

const {
  getAllServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService
} = require("../controllers/serviceController");

// ✅ GET all services
router.get("/", getAllServices);

// ✅ GET single service by slug
router.get("/:slug", getServiceBySlug);

// ✅ CREATE new service
router.post("/", createService);

// ✅ UPDATE service
router.put("/:id", updateService);

// ✅ DELETE service
router.delete("/:id", deleteService);

module.exports = router;