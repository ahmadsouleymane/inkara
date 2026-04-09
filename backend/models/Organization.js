import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    openingHours: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    siteConfig: {
      primaryColor: {
        type: String,
        default: '#4CAF7D',
      },
      coverImage: {
        type: String,
        default: '',
      },
      welcomeText: {
        type: String,
        default: '',
      },
    },
    loanSettings: {
      maxLoansPerUser: {
        type: Number,
        default: 3,
      },
      loanDurationDays: {
        type: Number,
        default: 14,
      },
    },
    customDomain: {
      type: String,
      default: null,
    },
    fineSettings: {
      enabled: { type: Boolean, default: false },
      amountPerDay: { type: Number, default: 0.5 },
      gracePeriodDays: { type: Number, default: 3 },
      maxFine: { type: Number, default: 20 },
    },
    featuredBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before validation
organizationSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
