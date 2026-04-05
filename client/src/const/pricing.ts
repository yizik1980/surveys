export const PRICING = {
  monthly: {
    pricePerMonth: 199,
    label: 'חודשי',
    billingNote: 'מחויב מדי חודש, ניתן לביטול',
  },
  annual: {
    pricePerMonth: 150,
    pricePerYear: 1800,
    label: 'שנתי',
    billingNote: 'מחויב שנתית',
    badge: 'חסכון 25%',
  },
} as const;
