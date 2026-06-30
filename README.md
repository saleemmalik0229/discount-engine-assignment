# Opptra Discount Engine

Customer-facing cart pricing engine for the Opptra FDE Intern assignment. Calculates item-level and cart-level discounts with a clear offer breakdown.

## Project Submission

This repository contains the completed **Discount Engine Assignment** for the Opptra Frontend Developer Intern position. The implementation is production-ready, fully tested, and features a responsive user interface built with React and powered by a robust discount calculation engine.

* **Live Deployment:** [https://discount-engine-assignment.vercel.app/](https://discount-engine-assignment.vercel.app/)
* **Status:** Production-Ready & Verified

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite dev server |
| `npm test` | Run Vitest unit + integration tests |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |

## Deploying

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.
The live deployment URL must be in your README before submission.

**Vercel (recommended):**

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Framework preset: **Vite** — build command `npm run build`, output directory `dist`
4. Deploy, then paste the URL into the Live Demo section above

## How to use

1. Upload `sample-data/rules.csv` as the discount rules input
2. Upload `sample-data/cart.csv` as the cart input
3. Click **Calculate Discounts**

## Project structure

```
src/
  domain/
    types.js              — JSDoc typedefs for all domain objects
    constants.js          — SCOPE and TYPE enums
  engine/
    discountEngine.js     — public API (pure discount logic)
    ruleMatcher.js        — rule-to-item matching
    discountCalculator.js — item-level discount math
    cartProcessor.js      — cart-level discount + summary builder
    __tests__/            — engine unit tests
  adapters/
    csv/
      rulesParser.js      — CSV → DiscountRule[]
      cartParser.js       — CSV → CartItem[]
    index.js              — uniform adapter exports
  hooks/
    useDiscountEngine.js  — reactive cart summary hook
  components/
    CsvUploader.jsx       — file upload area
    DataTable.jsx         — reusable table
    ErrorBanner.jsx       — parse error display
    CartSummaryPanel.jsx  — results + cart offer + final total
    MoneyDisplay.jsx      — INR formatter
  App.jsx                 — thin orchestration layer
  main.jsx                — entry point

sample-data/
  rules.csv               — sample discount rules (includes cart rule)
  cart.csv                — sample cart items
```

## CSV formats

**rules.csv**

| Column          | Type                    | Example          |
|-----------------|-------------------------|------------------|
| rule_id         | string                  | RULE-01          |
| scope           | brand \| platform \| cart | platform       |
| applies_to      | string (empty for cart) | Amazon India     |
| type            | percentage \| flat      | percentage       |
| value           | number                  | 15               |
| stackable       | true \| false           | false            |
| min_cart_value  | number (cart scope only)| 4000             |

**cart.csv**

| Column     | Type   | Example       |
|------------|--------|---------------|
| item_id    | string | ITEM-01       |
| product    | string | Cushion Cover |
| brand      | string | Natura Casa   |
| platform   | string | Amazon India  |
| base_price | number | 1299          |

## Discount logic

- **Non-stackable rules:** When multiple match an item, the one giving the largest saving in rupees wins.
- **Stackable rules:** Apply on top of the winning non-stackable rule (sequentially on reduced price).
- **No match:** Base price returned with "No offers available".
- **Cart-level rules:** Applied after all item discounts on the item subtotal. Threshold uses `>=`. When not met, no cart offer row is shown.

## Expected results for the sample data

| Item    | Base Price | Final Price | Reasoning                                      |
|---------|-----------|-------------|------------------------------------------------|
| ITEM-01 | Rs.1,299  | Rs.1,104    | Platform offer: 15% off (beats Rs.150 flat)    |
| ITEM-02 | Rs.849    | Rs.629      | Brand offer: Rs.150 off + Platform 10%         |
| ITEM-03 | Rs.599    | Rs.509      | Platform offer: 15% off                        |
| ITEM-04 | Rs.2,499  | Rs.2,499    | No offers available                            |
| ITEM-05 | Rs.449    | Rs.382      | Platform offer: 15% off                        |
| ITEM-06 | Rs.899    | Rs.809      | Platform offer: 10% off                        |

| Summary                        | Amount    |
|--------------------------------|-----------|
| Subtotal (after item offers)   | Rs.5,932  |
| Cart offer (RULE-04: 10% off)  | -Rs.593   |
| **Final Cart Total**           | **Rs.5,339** |

## Testing

```bash
npm test
```

Tests cover all 6 sample items, full cart totals, and cart threshold edge cases (Rs.3,999 vs Rs.4,000).
