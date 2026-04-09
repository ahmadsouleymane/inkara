import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      // Mise en page
      'hero', 'text', 'image', 'gallery', 'video', 'divider', 'cta-banner',
      'accordion', 'tabs', 'marquee', 'embed', 'spacer', 'before-after',
      // Bibliothèque
      'catalog', 'featured-books', 'new-arrivals', 'reading-lists', 'events',
      // Informations
      'stats', 'hours', 'faq', 'contact', 'map', 'pricing', 'timeline',
      // Engagement
      'testimonials', 'team', 'countdown', 'social-links',
      'newsletter', 'counter', 'logo-cloud',
    ],
  },
  props: { type: mongoose.Schema.Types.Mixed, default: {} },
  styles: { type: mongoose.Schema.Types.Mixed, default: {} },
  order: { type: Number, default: 0 },
}, { _id: false });

const sitePageSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  isHomepage: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  blocks: [blockSchema],
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    ogImage: { type: String, default: '' },
  },
}, { timestamps: true });

sitePageSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
sitePageSchema.index({ organizationId: 1, order: 1 });

export default mongoose.model('SitePage', sitePageSchema);
