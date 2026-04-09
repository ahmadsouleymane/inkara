export const PLANS = {
  free: {
    name: 'Free',
    limits: {
      books: 50,
      members: 50,
      publicSite: false,
      customDomain: false,
      analytics: 'basic',
      email: false,
      sms: false,
      siteTemplates: 1,
      readingLists: 3,
      broadcast: false,
    },
  },
  pro: {
    name: 'Pro',
    limits: {
      books: 200,
      members: 500,
      publicSite: true,
      customDomain: false,
      analytics: 'advanced',
      email: true,
      sms: false,
      siteTemplates: 5,
      readingLists: 20,
      broadcast: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    limits: {
      books: Infinity,
      members: Infinity,
      publicSite: true,
      customDomain: true,
      analytics: 'full',
      email: true,
      sms: true,
      siteTemplates: Infinity,
      readingLists: Infinity,
      broadcast: true,
    },
  },
};

export const getPlanLimits = (planId) => {
  return PLANS[planId]?.limits || PLANS.free.limits;
};

export const getPlanName = (planId) => {
  return PLANS[planId]?.name || 'Free';
};
