const mongoose = require('mongoose');

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
      minlength: 5,
      maxlength: 200,
    },
    titleKey: {
      type: String,
      sparse: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 10000,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-generate titleKey from title to prevent duplicate nulls
agreementTemplateSchema.pre('save', function(next) {
  if (this.title && !this.titleKey) {
    this.titleKey = this.title.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

agreementTemplateSchema.index({ ownerId: 1, version: -1 });
agreementTemplateSchema.index({ ownerId: 1, titleKey: 1 }, { sparse: true });

module.exports = mongoose.model('AgreementTemplate', agreementTemplateSchema);