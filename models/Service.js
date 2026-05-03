const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [250, 'Description cannot be more than 250 characters']
    },
    details: {
      type: String,
      required: [true, 'Please add full details']
    },
    icon: {
      type: String,
      default: '📦'
    },
    image_url: {
      type: String,
      default: null
    },
    category: {
      type: String,
      enum: ['Web', 'AI', 'Mobile', 'Design', 'Other'],
      default: 'Other'
    },
    price: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    features: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: {
      type: Number,
      default: 0
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);