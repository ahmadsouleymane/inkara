import mongoose from 'mongoose';

const siteThemeSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true,
  },
  template: {
    type: String,
    enum: ['classic', 'modern', 'minimal', 'academic'],
    default: 'modern',
  },
  colors: {
    primary: { type: String, default: '#4CAF7D' },
    secondary: { type: String, default: '#2196F3' },
    accent: { type: String, default: '#FF9800' },
    background: { type: String, default: '#FFFFFF' },
    text: { type: String, default: '#1a1a1a' },
  },
  fonts: {
    heading: { type: String, default: 'Inter' },
    body: { type: String, default: 'Inter' },
  },
  navigation: {
    style: { type: String, enum: ['fixed', 'static', 'transparent'], default: 'fixed' },
    showSearch: { type: Boolean, default: true },
    showLogin: { type: Boolean, default: true },
    links: [{
      label: { type: String },
      pageSlug: { type: String },
      order: { type: Number, default: 0 },
    }],
  },
  globalStyles: {
    buttons: {
      borderRadius: { type: String, enum: ['none', 'sm', 'md', 'lg', 'full'], default: 'md' },
      size: { type: String, enum: ['sm', 'md', 'lg'], default: 'md' },
      style: { type: String, enum: ['filled', 'outline', 'ghost'], default: 'filled' },
      hoverEffect: { type: String, enum: ['darken', 'lighten', 'scale', 'shadow'], default: 'darken' },
    },
    cards: {
      borderRadius: { type: String, enum: ['none', 'sm', 'md', 'lg', 'xl'], default: 'lg' },
      shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'sm' },
      border: { type: Boolean, default: true },
    },
    sections: {
      defaultSpacing: { type: String, enum: ['sm', 'md', 'lg', 'xl'], default: 'md' },
      maxWidth: { type: String, enum: ['narrow', 'default', 'wide', 'full'], default: 'default' },
    },
  },
  header: {
    layout: { type: String, enum: ['default', 'centered', 'split'], default: 'default' },
    logoPosition: { type: String, enum: ['left', 'center'], default: 'left' },
    showTopbar: { type: Boolean, default: false },
    topbarText: { type: String, default: '' },
    topbarBgColor: { type: String, default: '' },
    ctaButton: {
      show: { type: Boolean, default: false },
      text: { type: String, default: '' },
      link: { type: String, default: '' },
    },
    socialIcons: [{ platform: { type: String }, url: { type: String } }],
    backgroundColor: { type: String, default: '' },
  },
  footer: {
    layout: { type: String, enum: ['simple', 'columns', 'centered'], default: 'simple' },
    columns: [{
      title: { type: String },
      links: [{ label: { type: String }, url: { type: String } }],
    }],
    showNewsletter: { type: Boolean, default: false },
    newsletterTitle: { type: String, default: '' },
    socialIcons: [{ platform: { type: String }, url: { type: String } }],
    copyrightText: { type: String, default: '' },
    backgroundColor: { type: String, default: '' },
    textColor: { type: String, default: '' },
  },
}, { timestamps: true });

export default mongoose.model('SiteTheme', siteThemeSchema);
