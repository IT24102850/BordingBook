const mongoose = require('mongoose');

const agreementTemplateVersionSchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 20000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const agreementTemplateSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    titleKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    currentVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentContent: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 20000,
    },
    versions: {
      type: [agreementTemplateVersionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

agreementTemplateSchema.index({ ownerId: 1, titleKey: 1 }, { unique: true });
agreementTemplateSchema.index({ ownerId: 1, updatedAt: -1 });

module.exports = mongoose.model('AgreementTemplate', agreementTemplateSchema);
