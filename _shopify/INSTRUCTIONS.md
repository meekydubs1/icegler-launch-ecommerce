# Icegler on Shopify — 5-minute setup

You received two files:

1. **`icegler-theme.zip`** — the complete "Shaped by Light" theme
2. **`products.csv`** — the three frames (The Solstice, The Drift, The Basalt) with colorways, lenses, prices and photos

Nothing here touches your live store until you press **Publish** in the final step.

---

## Step 1 — Import the products (≈1 min)

1. In Shopify admin, go to **Products**.
2. Click **Import** (top right) → **Add file** → choose `products.csv` → **Upload and preview** → **Import products**.
3. Shopify fetches the product photos automatically from the preview site. When the import email arrives (usually under a minute), you're done.

You'll now have 3 products with 6 variants. The Solstice "Eclipse" colorway is intentionally out of stock — it shows as **"coming soon"** on the site. To launch it later, just add inventory.

## Step 2 — Upload the theme (≈1 min)

1. Go to **Online Store → Themes**.
2. Scroll to **Theme library** → **Add theme → Upload zip file** → choose `icegler-theme.zip`.
3. It appears in your library as **"Icegler — Shaped by Light"**, unpublished. Your current live theme is untouched.

## Step 3 — Create the four content pages (≈2 min)

The Lookbook, Story, Stores/Contact and Foundations designs live in the theme; they just need pages to attach to.

1. Go to **Online Store → Pages → Add page**.
2. Create four pages with **exactly these titles** (leave the content empty — the design is in the theme):
   - `Lookbook`
   - `Story`
   - `Contact`
   - `Foundations`
3. Attach the templates. Easiest way: open the new theme's **Customize**, use the page selector at the top to open each of the four pages, and set its **Template** to the matching one (`lookbook`, `story`, `contact`, `foundations`). If the template dropdown isn't offered before publishing, you can also do this right after Step 5: open each page in **Online Store → Pages** and pick the template under **Theme template**.

> The titles matter because the site's menus link to `/pages/lookbook`, `/pages/story`, `/pages/contact` and `/pages/foundations`. If you rename a page, its links will break.

## Step 4 — Preview

On the theme in your library, click **⋯ → Preview**. Click through everything: home, shop, a product, add to bag, the drawer, cart, checkout. The cart and checkout are your real Shopify checkout now.

## Step 5 — Publish

When you're happy: **⋯ → Publish** on the theme. Done.

---

## Your store settings (not theme work, but worth checking)

- **Payments**: Settings → Payments (activate Shopify Payments or your provider).
- **Shipping**: Settings → Shipping and delivery. The theme *displays* a free-shipping progress bar at €250 — create the matching free-shipping rate here so it's actually true. (The display threshold is adjustable under theme **Customize → Theme settings → Store**.)
- **Currency/Markets**: Settings → Markets (the design was built around EUR).
- **Checkout branding**: Settings → Checkout → Customize — upload the Icegler wordmark and set colors (basalt `#15191B`, glacial accent `#3E6E79`, background `#F2F4F4`) so the hosted checkout matches.
- **Policies**: Settings → Policies — once filled in, the footer's Privacy/Terms links point to them automatically.

## Good to know

- The newsletter forms are live: subscribers appear under **Customers** tagged `newsletter`, with marketing consent.
- The contact form emails your store's sender address.
- Product cards read two special tags on each product (`shape:…`, `tagline:…`) for their captions, and the "New" badge comes from a `new` tag. Keep those tags when editing products.
- If the home page ever shows "Import products.csv…" placeholder notes, the products aren't imported yet or their handles were changed (they must stay `the-solstice`, `the-drift`, `the-basalt`).
