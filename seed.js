require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("./models/Service");
const slugify = require("slugify");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Service.deleteMany({});

    const services = [
      {
        title: "Web Development",
        description: "Custom website and web application development using modern technologies",
        details: "We create responsive, fast, and secure websites using React, Node.js, and modern web technologies. Our team specializes in full-stack development with SEO optimization.",
        category: "Web",
        price: 2500,
        icon: "💻",
        image_url: "https://picsum.photos/500/300?random=1",
        features: ["Responsive Design", "SEO Optimized", "Fast Loading", "Secure"],
        rating: 4.8,
        reviews: 156,
        status: "active"
      },
      {
        title: "Mobile App Development",
        description: "Native and cross-platform mobile applications for iOS and Android",
        details: "Build powerful mobile applications with React Native and Flutter. We deliver production-ready apps with excellent performance and user experience.",
        category: "Mobile",
        price: 3500,
        icon: "📱",
        image_url: "https://picsum.photos/500/300?random=2",
        features: ["iOS & Android", "Native Performance", "App Store Ready", "Maintenance Support"],
        rating: 4.9,
        reviews: 203,
        status: "active"
      },
      {
        title: "AI & Machine Learning",
        description: "AI-powered solutions for automation, prediction, and intelligent automation",
        details: "Leverage machine learning and AI to transform your business. We develop custom AI models, chatbots, and intelligent automation systems.",
        category: "AI",
        price: 4000,
        icon: "🤖",
        image_url: "https://picsum.photos/500/300?random=3",
        features: ["Custom ML Models", "Chatbots", "Automation", "Analytics"],
        rating: 4.7,
        reviews: 89,
        status: "active"
      },
      {
        title: "UI/UX Design",
        description: "Professional user interface and experience design for digital products",
        details: "Create stunning and intuitive user interfaces. We provide wireframing, prototyping, user testing, and complete design systems.",
        category: "Design",
        price: 1800,
        icon: "🎨",
        image_url: "https://picsum.photos/500/300?random=4",
        features: ["Wireframes", "Prototypes", "User Testing", "Design System"],
        rating: 4.6,
        reviews: 112,
        status: "active"
      },
      {
        title: "Cloud Infrastructure",
        description: "AWS, Google Cloud, and Azure setup with complete DevOps support",
        details: "Scale your applications with enterprise-grade cloud solutions. We handle deployment, monitoring, and optimization on major cloud platforms.",
        category: "Web",
        price: 2200,
        icon: "☁️",
        image_url: "https://picsum.photos/500/300?random=5",
        features: ["Auto Scaling", "Load Balancing", "Security", "24/7 Support"],
        rating: 4.5,
        reviews: 124,
        status: "active"
      },
      {
        title: "E-commerce Solutions",
        description: "Complete e-commerce platform setup with payment integration",
        details: "Build a powerful online store with Shopify, WooCommerce, or custom solutions. We handle design, setup, payment integration, and optimization.",
        category: "Web",
        price: 3000,
        icon: "🛍️",
        image_url: "https://picsum.photos/500/300?random=6",
        features: ["Shopping Cart", "Payment Gateway", "Inventory System", "Order Management"],
        rating: 4.8,
        reviews: 145,
        status: "active"
      },
      {
        title: "API Development",
        description: "RESTful and GraphQL API development for seamless integration",
        details: "We design and develop robust APIs with proper authentication, error handling, and documentation for your web and mobile applications.",
        category: "Web",
        price: 2000,
        icon: "🔌",
        image_url: "https://picsum.photos/500/300?random=7",
        features: ["RESTful APIs", "GraphQL", "Authentication", "Documentation"],
        rating: 4.7,
        reviews: 98,
        status: "active"
      },
      {
        title: "Database Design & Optimization",
        description: "MongoDB, PostgreSQL, and MySQL database design and optimization",
        details: "Optimize your database performance with proper schema design, indexing, and query optimization. We handle migrations and scaling.",
        category: "Web",
        price: 1500,
        icon: "🗄️",
        image_url: "https://picsum.photos/500/300?random=8",
        features: ["Schema Design", "Indexing", "Query Optimization", "Scaling"],
        rating: 4.6,
        reviews: 76,
        status: "active"
      }
    ];

    // Save documents individually with slug generation
    for (const serviceData of services) {
      // Generate slug manually
      serviceData.slug = slugify(serviceData.title, { lower: true, strict: true });
      const service = new Service(serviceData);
      await service.save();
    }
    console.log("✅ Database seeded with 8 services");

    mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();
