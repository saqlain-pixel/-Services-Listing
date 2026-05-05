# Professional Services Platform - Technical Documentation

## Table of Contents
1. [Backend API Code](#backend-api-code)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Dynamic Services Page](#dynamic-services-page)
5. [Service Details Page](#service-details-page)

---

## Backend API Code

### Server Setup (server.js)

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Initialize database connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, ".")));

// API Routes
app.use("/api/services", require("./routes/serviceRoutes"));

// Page Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/services", (req, res) => {
    res.sendFile(path.join(__dirname, "services.html"));
});

app.get("/service-details", (req, res) => {
    res.sendFile(path.join(__dirname, "service-details.html"));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

**Key Features:**
- Express.js server with CORS enabled
- MongoDB database connection
- Static file serving
- RESTful API routing
- Page routing for HTML templates

---

## Database Schema

### MongoDB Schema (Service.js)

```javascript
const mongoose = require("mongoose");
const slugify = require("slugify");

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title required"],
        trim: true,
        maxlength: [100, "Max 100 characters"]
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
        // Auto-generated from title using slugify
    },
    description: {
        type: String,
        required: [true, "Description required"],
        maxlength: [250, "Max 250 characters"]
        // Short description for listing pages
    },
    details: {
        type: String,
        required: [true, "Details required"]
        // Long description for detail pages
    },
    icon: {
        type: String,
        default: "📦"
        // Unicode emoji or icon identifier
    },
    image_url: {
        type: String,
        default: null
        // URL to service image/banner
    },
    category: {
        type: String,
        enum: ["Web", "AI", "Mobile", "Design", "Other"],
        default: "Other"
        // Service category for filtering
    },
    price: {
        type: Number,
        default: null
        // Service pricing
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
        // Display status control
    },
    features: [String],
        // Array of key features/benefits
    
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
        // Service rating (0-5 stars)
    },
    reviews: {
        type: Number,
        default: 0
        // Number of reviews
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
    // Adds updatedAt automatically
});

module.exports = mongoose.model("Service", serviceSchema);
```

### Data Example (JSON)

```json
{
    "_id": "507f1f77bcf86cd799439011",
    "title": "Web Development",
    "slug": "web-development",
    "description": "Custom website and web application development",
    "details": "Full-stack development with React, Node.js, and modern technologies. SEO optimized.",
    "icon": "💻",
    "image_url": "/images/web-dev.svg",
    "category": "Web",
    "price": 2500,
    "status": "active",
    "features": ["Responsive", "SEO", "Fast", "Secure"],
    "rating": 4.8,
    "reviews": 156,
    "created_at": "2026-05-05T10:30:00Z",
    "updatedAt": "2026-05-05T10:30:00Z"
}
```

---

## API Endpoints

### Service Routes (serviceRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const {
    getAllServices,
    getServiceBySlug,
    createService,
    updateService,
    deleteService
} = require("../controllers/serviceController");

// Public Routes
router.get("/", getAllServices);                    // GET /api/services
router.get("/:slug", getServiceBySlug);             // GET /api/services/:slug

// Admin Routes (typically protected)
router.post("/", createService);                    // POST /api/services
router.put("/:id", updateService);                  // PUT /api/services/:id
router.delete("/:id", deleteService);               // DELETE /api/services/:id

module.exports = router;
```

### Controller Methods (serviceController.js)

#### 1. **GET /api/services** - Get All Services

```javascript
exports.getAllServices = async (req, res) => {
    try {
        const { category, status = "active", limit = 20, skip = 0 } = req.query;
        
        // Build filter object
        let filter = { status };
        if (category) filter.category = category;
        
        // Query services with pagination
        const services = await Service.find(filter)
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ created_at: -1 });
        
        const total = await Service.countDocuments(filter);
        
        return sendResponse(res, 200, "Services fetched", {
            services,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: parseInt(skip) + parseInt(limit) < total
            }
        });
    } catch (error) {
        return sendResponse(res, 500, "Server error", error.message);
    }
};
```

**Query Parameters:**
- `category` (optional): Filter by category (Web, AI, Mobile, Design, Other)
- `status` (default: "active"): Filter by status
- `limit` (default: 20): Number of results per page
- `skip` (default: 0): Number of results to skip

**Response:**
```json
{
    "success": true,
    "message": "Services fetched",
    "data": {
        "services": [...],
        "pagination": {
            "total": 8,
            "limit": 20,
            "skip": 0,
            "hasMore": false
        }
    }
}
```

---

#### 2. **GET /api/services/:slug** - Get Service by Slug

```javascript
exports.getServiceBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        if (!slug) {
            return sendResponse(res, 400, "Slug required");
        }
        
        const service = await Service.findOne({
            slug: slug,
            status: "active"
        });
        
        if (!service) {
            return sendResponse(res, 404, "Service not found");
        }
        
        return sendResponse(res, 200, "Service fetched", service);
    } catch (error) {
        return sendResponse(res, 500, "Server error", error.message);
    }
};
```

**URL Example:** `/api/services/web-development`

**Response:**
```json
{
    "success": true,
    "message": "Service fetched",
    "data": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Web Development",
        "slug": "web-development",
        "description": "Custom website and web application development",
        "details": "Full-stack development with React, Node.js, and modern technologies...",
        "category": "Web",
        "price": 2500,
        "features": ["Responsive", "SEO", "Fast", "Secure"],
        "rating": 4.8,
        "reviews": 156
    }
}
```

---

#### 3. **POST /api/services** - Create Service

```javascript
exports.createService = async (req, res) => {
    try {
        const {
            title,
            description,
            details,
            category,
            price,
            icon,
            image_url,
            features
        } = req.body;
        
        // Validation
        if (!title || !description || !details) {
            return sendResponse(res, 400, "Required fields missing");
        }
        
        // Check if service already exists
        const existing = await Service.findOne({ title });
        if (existing) {
            return sendResponse(res, 400, "Service already exists");
        }
        
        // Create new service
        const service = new Service({
            title,
            description,
            details,
            category,
            price,
            icon,
            image_url,
            features: features || [],
            status: "active"
        });
        
        await service.save();
        return sendResponse(res, 201, "Service created", service);
    } catch (error) {
        return sendResponse(res, 500, "Server error", error.message);
    }
};
```

**Request Body:**
```json
{
    "title": "New Service",
    "description": "Brief description",
    "details": "Detailed information",
    "category": "Web",
    "price": 2000,
    "icon": "🚀",
    "image_url": "/images/service.svg",
    "features": ["Feature 1", "Feature 2"]
}
```

---

#### 4. **PUT /api/services/:id** - Update Service

```javascript
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (!id) {
            return sendResponse(res, 400, "Service ID required");
        }
        
        // Find service
        const service = await Service.findById(id);
        if (!service) {
            return sendResponse(res, 404, "Service not found");
        }
        
        // Validate updates
        if (updates.title && updates.title.length < 3) {
            return sendResponse(res, 400, "Title must be at least 3 characters");
        }
        
        if (updates.status && !["active", "inactive"].includes(updates.status)) {
            return sendResponse(res, 400, "Invalid status value");
        }
        
        // Apply updates
        const updated = await Service.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );
        
        return sendResponse(res, 200, "Service updated", updated);
    } catch (error) {
        return sendResponse(res, 500, "Server error", error.message);
    }
};
```

---

#### 5. **DELETE /api/services/:id** - Delete Service

```javascript
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return sendResponse(res, 400, "Service ID required");
        }
        
        // Find service
        const service = await Service.findById(id);
        if (!service) {
            return sendResponse(res, 404, "Service not found");
        }
        
        // Delete service
        await Service.findByIdAndDelete(id);
        return sendResponse(res, 200, "Service deleted");
    } catch (error) {
        return sendResponse(res, 500, "Server error", error.message);
    }
};
```

---

## Dynamic Services Page

### Frontend Implementation (services.html)

#### Key Features:
- ✅ Fetch services from API
- ✅ Filter by category (Web, Mobile, AI, Design)
- ✅ Search functionality
- ✅ Pagination (6 items per page)
- ✅ Client-side caching (10 minutes)
- ✅ Loading states and error handling
- ✅ XSS protection with HTML escaping

#### JavaScript Code Structure:

```javascript
// Configuration
const API_URL = 'http://localhost:5000/api/services';
const CACHE_EXPIRY = 600000;      // 10 minutes
const ITEMS_PER_PAGE = 6;

// State Management
let allServices = [];
let filteredServices = [];
let currentPage = 1;
let searchQuery = '';
let selectedCategory = '';

// DOM Cache
const DOM = {
    loading: null,
    error: null,
    errorMsg: null,
    container: null,
    emptyState: null,
    pagination: null,
    pageInfo: null,
    pageNumbers: null,
    prevBtn: null,
    nextBtn: null,
    searchInput: null,
    cacheIndicator: null
};

// Helper Functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

function initDOM() {
    DOM.loading = document.getElementById('loading');
    DOM.error = document.getElementById('error');
    DOM.errorMsg = document.querySelector('.error-message');
    DOM.container = document.getElementById('servicesContainer');
    DOM.emptyState = document.getElementById('emptyState');
    DOM.pagination = document.getElementById('pagination');
    DOM.pageInfo = document.getElementById('pageInfo');
    DOM.pageNumbers = document.getElementById('pageNumbers');
    DOM.prevBtn = document.getElementById('prevBtn');
    DOM.nextBtn = document.getElementById('nextBtn');
    DOM.searchInput = document.getElementById('searchInput');
    DOM.cacheIndicator = document.getElementById('cacheIndicator');
}

// Caching System
class ServiceCache {
    static getCacheKey(category = '') {
        return `services_cache_${category || 'all'}`;
    }
    
    static getCacheTimestampKey(category = '') {
        return `services_cache_timestamp_${category || 'all'}`;
    }
    
    static isExpired(category = '') {
        const timestamp = localStorage.getItem(this.getCacheTimestampKey(category));
        return !timestamp || Date.now() - parseInt(timestamp) > CACHE_EXPIRY;
    }
    
    static get(category = '') {
        if (this.isExpired(category)) {
            this.clear(category);
            return null;
        }
        const data = localStorage.getItem(this.getCacheKey(category));
        return data ? JSON.parse(data) : null;
    }
    
    static set(data, category = '') {
        localStorage.setItem(this.getCacheKey(category), JSON.stringify(data));
        localStorage.setItem(this.getCacheTimestampKey(category), Date.now().toString());
    }
    
    static clear(category = '') {
        localStorage.removeItem(this.getCacheKey(category));
        localStorage.removeItem(this.getCacheTimestampKey(category));
    }
    
    static clearAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('services_cache_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

// API Functions
async function fetchServices(category = '') {
    try {
        DOM.loading.style.display = 'block';
        DOM.error.style.display = 'none';
        
        let isCached = false;
        let services = ServiceCache.get(category);
        
        if (services) {
            isCached = true;
        } else {
            const url = category
                ? `${API_URL}?category=${category}`
                : API_URL;
            
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success) {
                services = result.data.services || result.data;
            } else {
                throw new Error(result.message || 'Failed to fetch services');
            }
            
            ServiceCache.set(services, category);
        }
        
        allServices = services;
        currentPage = 1;
        applyFilters();
        showCacheIndicator(isCached);
        DOM.loading.style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
        DOM.loading.style.display = 'none';
        DOM.error.style.display = 'block';
        DOM.errorMsg.textContent = error.message || 'Unable to load services.';
        DOM.container.innerHTML = '';
        DOM.pagination.style.display = 'none';
    }
}

// Filtering and Sorting
function applyFilters() {
    filteredServices = allServices.filter(service =>
        searchQuery === '' ||
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    renderPaginatedServices();
    updatePagination();
}

function renderPaginatedServices() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    renderServices(filteredServices.slice(start, start + ITEMS_PER_PAGE));
}

// Rendering
function renderServices(services) {
    if (services.length === 0) {
        DOM.emptyState.style.display = 'block';
        DOM.container.innerHTML = '';
        DOM.pagination.style.display = 'none';
        return;
    }
    
    DOM.emptyState.style.display = 'none';
    DOM.container.innerHTML = services.map(service => `
        <div class="service-card" onclick="viewDetails('${escapeHtml(service.slug)}')">
            <div class="service-image">
                ${service.image_url
                    ? `<img src="${escapeHtml(service.image_url)}" alt="${escapeHtml(service.title)}" loading="lazy">`
                    : escapeHtml(service.icon || '◆')
                }
            </div>
            <div class="service-content">
                <div class="service-category">${escapeHtml(service.category)}</div>
                <h3 class="service-title">${escapeHtml(service.title)}</h3>
                <p class="service-description">${escapeHtml(service.description)}</p>
                <div class="service-footer">
                    <div class="service-rating">
                        <span class="stars">★</span>
                        ${service.rating || 0} (${service.reviews || 0})
                    </div>
                    ${service.price ? `<div class="service-price">$${service.price}</div>` : ''}
                </div>
                <button class="btn">View Details</button>
            </div>
        </div>
    `).join('');
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
    
    DOM.pagination.style.display = totalPages <= 1 ? 'none' : 'flex';
    DOM.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    DOM.prevBtn.disabled = currentPage === 1;
    DOM.nextBtn.disabled = currentPage === totalPages;
    
    // Render page buttons
    const pageNumbers = DOM.pageNumbers;
    pageNumbers.innerHTML = '';
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage + 1 < 5) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let page = startPage; page <= endPage; page++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${page === currentPage ? 'active' : ''}`;
        btn.textContent = page;
        btn.onclick = () => goToPage(page);
        pageNumbers.appendChild(btn);
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPaginatedServices();
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function nextPage() {
    if (currentPage < Math.ceil(filteredServices.length / ITEMS_PER_PAGE)) {
        currentPage++;
        renderPaginatedServices();
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToPage(page) {
    currentPage = page;
    renderPaginatedServices();
    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigation
function viewDetails(slug) {
    window.location.href = `service-details.html?slug=${slug}`;
}

// UI Functions
function resetSearch() {
    searchQuery = '';
    DOM.searchInput.value = '';
    currentPage = 1;
    applyFilters();
}

function resetAllFilters() {
    searchQuery = '';
    selectedCategory = '';
    currentPage = 1;
    DOM.searchInput.value = '';
    document.querySelector('input[name="category"][value=""]').checked = true;
    fetchServices();
}

function showCacheIndicator(isCached) {
    DOM.cacheIndicator.textContent = isCached ? '💾 Cached' : '';
    if (isCached) {
        setTimeout(() => {
            DOM.cacheIndicator.textContent = '';
        }, 5000);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    
    DOM.searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        currentPage = 1;
        applyFilters();
    });
    
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', (e) => {
            selectedCategory = e.target.value;
            currentPage = 1;
            fetchServices(selectedCategory);
        });
    });
    
    fetchServices();
});
```

---

## Service Details Page

### Frontend Implementation (service-details.html)

#### Key Features:
- ✅ Fetch single service by slug
- ✅ Dynamic content rendering
- ✅ Error handling
- ✅ XSS protection
- ✅ Responsive design
- ✅ Back navigation

#### JavaScript Code Structure:

```javascript
const API_URL = 'http://localhost:5000/api/services';

// DOM Cache
const DOM = {
    loading: null,
    error: null,
    errorMsg: null,
    container: null
};

// Security: Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

// Cache DOM references
function initDOM() {
    DOM.loading = document.getElementById('loading');
    DOM.error = document.getElementById('error');
    DOM.errorMsg = document.querySelector('.error-message');
    DOM.container = document.getElementById('serviceContainer');
}

// Fetch service details from API
async function loadServiceDetails() {
    try {
        // Get slug from URL query parameter
        const slug = new URLSearchParams(window.location.search).get('slug');
        
        if (!slug) {
            showError('Service slug not found in URL');
            return;
        }
        
        // Fetch service
        const response = await fetch(`${API_URL}/${slug}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        // Validate response
        if (!result.success || !result.data) {
            showError(result.message || 'Service not found');
            return;
        }
        
        // Display service details
        displayService(result.data);
        DOM.loading.style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
        showError(`Unable to load service details: ${error.message}`);
    }
}

// Build features HTML
function buildFeaturesHTML(features) {
    return features && features.length
        ? features.map(f =>
            `<div class="feature-item"><div class="feature-text">${escapeHtml(f)}</div></div>`
          ).join('')
        : '';
}

// Render service details to page
function displayService(service) {
    const featuresHTML = buildFeaturesHTML(service.features);
    
    // Build image HTML
    const imageHTML = service.image_url
        ? `<img src="${escapeHtml(service.image_url)}" alt="${escapeHtml(service.title)}" class="service-img">`
        : `<span>${escapeHtml(service.icon || '◆')}</span>`;
    
    // Build complete HTML
    let html = `
        <div class="service-header">
            <div class="service-image">${imageHTML}</div>
            <div class="service-info">
                <span class="service-category">${escapeHtml(service.category)}</span>
                <h1 class="service-title">${escapeHtml(service.title)}</h1>
                <div class="service-rating">
                    <span class="stars">★</span>
                    <span>${service.rating || 0} (${service.reviews || 0} reviews)</span>
                </div>
    `;
    
    // Add price if available
    if (service.price) {
        html += `<div class="service-price">$${service.price}</div>`;
    }
    
    html += `<p class="service-description">${escapeHtml(service.description)}</p></div></div>`;
    
    // Add features section if available
    if (featuresHTML) {
        html += `
            <div class="features-section">
                <h3>Key Features</h3>
                <div class="features-list">${featuresHTML}</div>
            </div>
        `;
    }
    
    // Add details section if available
    if (service.details) {
        html += `
            <div class="details-section">
                <h3>About This Service</h3>
                <p>${escapeHtml(service.details)}</p>
            </div>
        `;
    }
    
    // Add CTA section
    html += `
        <div class="cta-section">
            <h2>Ready to Get Started?</h2>
            <p>Contact us today to learn more about how we can help your business</p>
            <div class="btn-group">
                <a href="mailto:info@services.com" class="btn btn-primary">Contact Us</a>
                <a href="services.html" class="btn btn-secondary">Back to Services</a>
            </div>
        </div>
    `;
    
    DOM.container.innerHTML = html;
}

// Display error message
function showError(message) {
    DOM.loading.style.display = 'none';
    DOM.error.style.display = 'block';
    DOM.errorMsg.textContent = message;
    DOM.container.innerHTML = '';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    loadServiceDetails();
});
```

---

## API Usage Examples

### Fetch All Services
```bash
curl http://localhost:5000/api/services
```

### Fetch Services by Category
```bash
curl "http://localhost:5000/api/services?category=Web"
```

### Fetch Specific Service by Slug
```bash
curl http://localhost:5000/api/services/web-development
```

### Create New Service
```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Consulting Services",
    "description": "Expert consulting for digital transformation",
    "details": "Our consulting services help businesses...",
    "category": "Web",
    "price": 3000,
    "icon": "💼",
    "features": ["Strategy", "Planning", "Execution"]
  }'
```

### Update Service
```bash
curl -X PUT http://localhost:5000/api/services/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 3500,
    "status": "inactive"
  }'
```

### Delete Service
```bash
curl -X DELETE http://localhost:5000/api/services/507f1f77bcf86cd799439011
```

---

## Architecture Summary

### Technology Stack
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ODM
- **Frontend:** Vanilla JavaScript (ES6+)
- **Caching:** Browser localStorage
- **Security:** XSS protection, input validation

### File Structure
```
project/
├── server.js                          # Express server setup
├── config/
│   └── db.js                          # MongoDB connection
├── models/
│   └── Service.js                     # Service schema
├── controllers/
│   └── serviceController.js           # API logic
├── routes/
│   └── serviceRoutes.js               # API routes
├── services.html                      # Services listing page
├── service-details.html               # Service detail page
├── index.css                          # Global styles
└── package.json                       # Dependencies
```

### Security Features
✅ HTML escaping in all user-facing content
✅ Input validation in API controllers
✅ CORS enabled for cross-origin requests
✅ Slug-based URL safety (no direct IDs in URLs)
✅ Status filtering prevents inactive services from displaying

### Performance Optimizations
✅ Client-side caching (10-minute TTL)
✅ DOM element caching to reduce repeated queries
✅ Lazy loading for images
✅ Pagination to limit DOM size
✅ Minified CSS in production
✅ Efficient database queries with indexes

---

## Future Enhancements

- Authentication & Authorization
- Service reviews and ratings system
- Real-time updates with WebSockets
- Advanced filtering (price range, rating)
- Service comparison feature
- Customer booking system
- Admin dashboard
- Service analytics
- SEO optimization (meta tags, structured data)
- Internationalization (multi-language support)

---

**Document Version:** 1.0
**Last Updated:** May 5, 2026
**Project:** Professional Services Platform
