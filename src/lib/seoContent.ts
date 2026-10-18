// Single source for every SEO title / meta description / H1 / body-copy block (Phase 4).
// Copy strings may contain:
//   [label](/path)   -> rendered as an internal <Link> by <SeoCopy />
//   {PAYMENTS}       -> payment methods the admin has enabled
//   {DELIVERY_RATE}  -> non-Karachi delivery fee from store settings
// Only claims that are true on the live site are used (payments, delivery, sizes S-XL,
// 1/2/3-piece, 30% sale, WhatsApp order updates, defect-only returns).

import { SALE_DISCOUNT_PERCENT } from '@/lib/seo';

export interface CopyBlock {
  heading: string;
  paragraphs: string[];
}

export interface PageSeo {
  /** Final <title> (<= 60 chars, includes the brand). */
  title: string;
  /** Meta description (<= 155 chars). */
  description: string;
  h1: string;
  blocks: CopyBlock[];
}

// ─── Home ────────────────────────────────────────────────────────────────────────────────

export const HOME_SEO: PageSeo = {
  title: "Women's Suits Online Pakistan | Lawn, Khaddar | Brandox",
  description:
    'Shop stitched & unstitched lawn, cotton and khaddar suits in 1, 2 and 3-piece. Cash on Delivery, free delivery in Karachi. Order online today.',
  h1: "Women's Suits in Lawn, Cotton & Khaddar",
  blocks: [
    {
      heading: 'Shop Suits Online from Brandox',
      paragraphs: [
        'Brandox is a Pakistani women’s clothing store for stitched and unstitched suits in lawn, cotton, khaddar, chiffon and silk. Choose a 1-, 2- or 3-piece set, filter by fabric and size, and order from home.',
        'We built the store around how people in Pakistan actually shop. You can pay by {PAYMENTS}. Delivery in Karachi is free, and it is {DELIVERY_RATE} to the rest of Pakistan.',
        'Not sure which fabric suits the season? Lawn is light and breathable for summer, while khaddar is warmer and better for winter days. Start with our [lawn suits](/fabric/lawn) or [khaddar suits](/fabric/khaddar), or see the [sale](/sale) for 30% off.',
        'Prefer a ready-to-wear fit? Browse [stitched suits](/category/stitched). If you like to tailor your own, our [unstitched suits](/category/unstitched-suits) come as complete sets. Living in Karachi? See how [free delivery in Karachi](/karachi) works.',
      ],
    },
  ],
};

// ─── /products ───────────────────────────────────────────────────────────────────────────

export const PRODUCTS_SEO: PageSeo = {
  title: "Shop All Women's Suits Online in Pakistan | Brandox",
  description:
    'Browse all stitched and unstitched suits in lawn, cotton, khaddar, chiffon and silk. Filter by fabric and size. Cash on Delivery available.',
  h1: "All Women's Suits",
  blocks: [
    {
      heading: 'Shop the Full Range',
      paragraphs: [
        'Every Brandox suit in one place. Use the filters to narrow by fabric, stitched or unstitched, and size (S to XL). New to the store? Start with [lawn suits](/fabric/lawn) for warm weather or [khaddar suits](/fabric/khaddar) for winter, or check the [sale](/sale) for reduced prices.',
        'All orders can be paid by {PAYMENTS}, and delivery is free in Karachi.',
      ],
    },
  ],
};

// ─── Categories (keyed by category slug) ─────────────────────────────────────────────────

const UNSTITCHED_SEO: PageSeo = {
  title: 'Unstitched Suits for Women Online in Pakistan | Brandox',
  description:
    'Buy unstitched lawn, cotton and khaddar suits online. 1, 2 and 3-piece sets with embroidery. Cash on Delivery, free delivery in Karachi.',
  h1: 'Unstitched Suits for Women',
  blocks: [
    {
      heading: 'What Comes in an Unstitched Suit',
      paragraphs: [
        'Unstitched suits let you choose your own fit. You buy the fabric as a set and take it to your tailor, so the cut, length and sleeves are exactly how you want them.',
        'A 3-piece set usually includes the kameez (shirt) fabric, trouser or shalwar fabric and a matching dupatta. 2-piece sets include the shirt and trouser, and 1-piece is the shirt fabric alone. The product page lists exactly what is in each set.',
      ],
    },
    {
      heading: 'Choose Your Fabric',
      paragraphs: [
        'Pick the fabric for the season. [Lawn](/fabric/lawn) is light and comfortable for summer. [Khaddar](/fabric/khaddar) is warmer and has a soft texture for winter. We also carry cotton, chiffon and silk.',
      ],
    },
    {
      heading: 'Delivery and Payment',
      paragraphs: [
        'Pay by {PAYMENTS}. Delivery in Karachi is free and it is {DELIVERY_RATE} elsewhere in Pakistan. If you would rather skip the tailor, see our [stitched suits](/category/stitched), or look at [sale suits](/sale) for 30% off.',
      ],
    },
  ],
};

const STITCHED_SEO: PageSeo = {
  title: 'Stitched Suits for Women Online in Pakistan | Brandox',
  description:
    'Ready-to-wear stitched suits in S, M, L and XL. Lawn, cotton and khaddar with embroidery. Cash on Delivery; free delivery in Karachi.',
  h1: 'Stitched Suits for Women',
  blocks: [
    {
      heading: 'Ready-to-Wear in Every Size',
      paragraphs: [
        'Stitched suits are ready to wear the day they arrive, with no waiting for a tailor. Sizes run from S to XL, and each product page shows the options available for that design.',
      ],
    },
    {
      heading: 'Pick by Fabric',
      paragraphs: [
        'Choose your fabric based on the weather. [Lawn](/fabric/lawn) is light for hot days, and [khaddar](/fabric/khaddar) keeps you warm in winter. You will also find cotton, chiffon and silk in 1-, 2- and 3-piece sets, from everyday wear to occasion outfits.',
        'Not sure about the fit? Check the size options on the product page before ordering. If you like a custom cut, try our [unstitched suits](/category/unstitched-suits) and have them made to your measurements. The [size guide](/size-guide) explains how to measure.',
      ],
    },
    {
      heading: 'Delivery and Payment',
      paragraphs: [
        'You can pay by {PAYMENTS}. Delivery in Karachi is free, and the rest of Pakistan is {DELIVERY_RATE}. Looking for a deal? See the [sale](/sale).',
      ],
    },
  ],
};

const KAMIZ_SHALWAR_SEO: PageSeo = {
  title: 'Kamiz Shalwar for Women Online in Pakistan | Brandox',
  description:
    'Shop women’s kamiz shalwar sets in lawn, cotton and khaddar. Comfortable everyday and occasion wear. Cash on Delivery across Pakistan.',
  h1: 'Kamiz Shalwar for Women',
  blocks: [
    {
      heading: 'Everyday and Occasion Wear',
      paragraphs: [
        'Kamiz shalwar is the outfit most women in Pakistan reach for first, and this collection covers both everyday and occasion wear. Each set pairs a kameez with a matching shalwar or trouser, and some include a dupatta.',
      ],
    },
    {
      heading: 'Choose Your Fabric',
      paragraphs: [
        'Lawn and cotton keep things breathable in warm weather, and khaddar is a good pick when it gets cold. See all our [lawn suits](/fabric/lawn) and [khaddar suits](/fabric/khaddar) for more designs in those fabrics.',
        'Every order can be paid by {PAYMENTS}. Delivery in Karachi is free and {DELIVERY_RATE} to the rest of Pakistan. If you prefer to choose your own tailoring, browse [unstitched suits](/category/unstitched-suits), or head to the [sale](/sale) for reduced prices.',
      ],
    },
  ],
};

/** Keyed by the category's URL slug as it exists in the admin panel. */
export const CATEGORY_SEO: Record<string, PageSeo> = {
  'unstitched-suits': UNSTITCHED_SEO,
  unstitched: UNSTITCHED_SEO, // old slug, in case it still exists
  stitched: STITCHED_SEO,
  'stitched-suits': STITCHED_SEO,
  'kamiz-shalwar': KAMIZ_SHALWAR_SEO,
};

// ─── /sale ───────────────────────────────────────────────────────────────────────────────

export const SALE_SEO: PageSeo = {
  title: `Sale: ${SALE_DISCOUNT_PERCENT}% Off Women's Suits in Pakistan | Brandox`,
  description: `Save ${SALE_DISCOUNT_PERCENT}% on lawn, cotton and khaddar suits. Limited-time prices, Cash on Delivery and free delivery in Karachi. Shop the sale now.`,
  h1: `Sale: ${SALE_DISCOUNT_PERCENT}% Off Women's Suits`,
  blocks: [
    {
      heading: 'How the Sale Works',
      paragraphs: [
        `Everything in our sale is discounted by ${SALE_DISCOUNT_PERCENT}% or more. Prices shown on each product already include the discount, and the original price is crossed out next to it.`,
        'Sale stock changes, so if you see something you like, order it before it goes. Sale orders get the same options as everything else: {PAYMENTS}, with free delivery in Karachi and {DELIVERY_RATE} elsewhere.',
        'You can also browse the full range of [stitched suits](/category/stitched) and [unstitched suits](/category/unstitched-suits), or shop by fabric: [lawn](/fabric/lawn) and [khaddar](/fabric/khaddar).',
      ],
    },
  ],
};

// ─── /fabric/[type] ──────────────────────────────────────────────────────────────────────

export const FABRIC_SEO: Record<string, PageSeo> = {
  khaddar: {
    title: 'Khaddar Suits for Women | Winter Collection | Brandox',
    description:
      'Warm khaddar suits for women in 1, 2 and 3-piece sets. Stitched and unstitched, Cash on Delivery, free delivery in Karachi.',
    h1: 'Khaddar Suits for Women',
    blocks: [
      {
        heading: 'Why Khaddar for Winter',
        paragraphs: [
          'Khaddar is a woven cotton with a soft, slightly textured feel. It is warmer than lawn, so it is a popular winter choice for daily wear and for dressing up.',
        ],
      },
      {
        heading: 'Stitched or Unstitched',
        paragraphs: [
          'Our khaddar suits come in 1-, 2- and 3-piece sets, stitched or unstitched. Choose [stitched suits](/category/stitched) if you want something ready to wear, or [unstitched suits](/category/unstitched-suits) to have it made to your measurements.',
          'If you are building a winter wardrobe, you can pair khaddar with a shawl or a warm dupatta. When the weather warms up, switch to [lawn suits](/fabric/lawn).',
        ],
      },
      {
        heading: 'Delivery and Payment',
        paragraphs: [
          'Pay by {PAYMENTS}. Delivery is free in Karachi and {DELIVERY_RATE} to the rest of Pakistan. Check the [sale](/sale) for reduced khaddar suits.',
        ],
      },
    ],
  },
  lawn: {
    title: 'Lawn Suits for Women Online in Pakistan | Brandox',
    description:
      'Shop embroidered and printed lawn suits in 1, 2 and 3-piece sets. Stitched and unstitched. Cash on Delivery, free delivery in Karachi.',
    h1: 'Lawn Suits for Women',
    blocks: [
      {
        heading: 'Why Lawn for Summer',
        paragraphs: [
          'Lawn is a light, breathable cotton fabric and the standard choice for Pakistani summers. It stays comfortable in heat and humidity, which is why so many women wear it daily from spring to autumn.',
        ],
      },
      {
        heading: 'Embroidered and Printed Lawn',
        paragraphs: [
          'You will find embroidered and printed lawn suits here in 1-, 2- and 3-piece sets. Pick [stitched suits](/category/stitched) for ready-to-wear sizes S to XL, or [unstitched suits](/category/unstitched-suits) if you prefer your own tailor. For cooler months, take a look at our [khaddar suits](/fabric/khaddar).',
        ],
      },
      {
        heading: 'Delivery and Payment',
        paragraphs: [
          'Payment options are {PAYMENTS}. Delivery is free in Karachi and {DELIVERY_RATE} elsewhere in Pakistan. Browse the [sale](/sale) for lawn suits at reduced prices.',
        ],
      },
    ],
  },
  cotton: {
    title: 'Cotton Suits for Women Online in Pakistan | Brandox',
    description:
      'Shop soft cotton suits for women in 1, 2 and 3-piece sets. Stitched and unstitched. Cash on Delivery, free delivery in Karachi.',
    h1: 'Cotton Suits for Women',
    blocks: [
      {
        heading: 'Everyday Comfort in Cotton',
        paragraphs: [
          'Cotton is soft, breathable and easy to look after, which makes it a dependable fabric for everyday suits. Choose [stitched suits](/category/stitched) for ready-to-wear sizes, or [unstitched suits](/category/unstitched-suits) to tailor your own.',
          'For lighter summer fabric see our [lawn suits](/fabric/lawn); for winter see [khaddar suits](/fabric/khaddar). Pay by {PAYMENTS}. Delivery is free in Karachi and {DELIVERY_RATE} elsewhere in Pakistan.',
        ],
      },
    ],
  },
  chiffon: {
    title: 'Chiffon Suits for Women Online in Pakistan | Brandox',
    description:
      'Shop lightweight chiffon suits and dupattas for women. Stitched and unstitched. Cash on Delivery, free delivery in Karachi.',
    h1: 'Chiffon Suits for Women',
    blocks: [
      {
        heading: 'Light, Flowing Chiffon',
        paragraphs: [
          'Chiffon is a light, flowing fabric often chosen for dupattas and dressier outfits. Pair it with a plain kameez, or choose a full set in [stitched](/category/stitched) or [unstitched](/category/unstitched-suits) form.',
          'Pay by {PAYMENTS}. Delivery is free in Karachi and {DELIVERY_RATE} elsewhere in Pakistan. See the [sale](/sale) for reduced prices.',
        ],
      },
    ],
  },
  silk: {
    title: 'Silk Suits for Women Online in Pakistan | Brandox',
    description:
      'Shop silk suits for women for occasions and formal wear. Stitched and unstitched. Cash on Delivery, free delivery in Karachi.',
    h1: 'Silk Suits for Women',
    blocks: [
      {
        heading: 'Silk for Occasion Wear',
        paragraphs: [
          'Silk has a smooth, polished finish that suits formal events and special occasions. Choose [stitched suits](/category/stitched) for a ready-to-wear fit, or [unstitched suits](/category/unstitched-suits) to have it made to your measurements.',
          'Pay by {PAYMENTS}. Delivery is free in Karachi and {DELIVERY_RATE} elsewhere in Pakistan. See the [sale](/sale) for reduced prices.',
        ],
      },
    ],
  },
};

// ─── /karachi ────────────────────────────────────────────────────────────────────────────

export const KARACHI_SEO: PageSeo = {
  title: "Buy Women's Suits Online in Karachi | Free Delivery",
  description:
    'Order lawn, cotton and khaddar suits online in Karachi with free delivery. Pay by Cash on Delivery, JazzCash, EasyPaisa or bank transfer.',
  h1: "Women's Suits Online in Karachi",
  blocks: [
    {
      heading: 'Free Delivery in Karachi',
      paragraphs: [
        'Shopping for suits in Karachi should not mean paying extra for delivery. At Brandox, delivery within Karachi is free, and you can choose from stitched and unstitched suits in lawn, cotton, khaddar, chiffon and silk.',
        'Start with the [lawn suits](/fabric/lawn), [khaddar suits](/fabric/khaddar), [stitched suits](/category/stitched) or [unstitched suits](/category/unstitched-suits), or see what is on [sale](/sale).',
      ],
    },
    {
      heading: 'Ways to Pay',
      paragraphs: [
        'You can pay by {PAYMENTS}. If you want to see the order before paying, Cash on Delivery is the simplest choice. We send order updates on WhatsApp, and you can look up an order any time on the [Track an order](/track-order) page.',
      ],
    },
    {
      heading: 'Delivering Outside Karachi',
      paragraphs: ['Ordering from another city? We deliver across Pakistan for {DELIVERY_RATE}.'],
    },
  ],
};

export const KARACHI_FAQ = [
  {
    question: 'Is delivery really free in Karachi?',
    answer: 'Yes. Delivery within Karachi is free; elsewhere in Pakistan it is {DELIVERY_RATE}.',
  },
  {
    question: 'Can I pay when the order arrives?',
    answer: 'Yes, Cash on Delivery is available. Accepted payment methods: {PAYMENTS}.',
  },
  {
    question: 'How will I know where my order is?',
    answer:
      'Updates come by WhatsApp, and the [Track an order](/track-order) page shows the status. We do not provide courier tracking.',
  },
  {
    question: 'Do you deliver outside Karachi?',
    answer: 'Yes, anywhere in Pakistan for {DELIVERY_RATE}.',
  },
];
