# Icegler — Launch Ecommerce Preview

A clickable design preview for **Icegler**, a premium Icelandic eyewear brand — sunglasses designed in Reykjavík and shaped by Icelandic light.

## Live preview

➡️ **https://meekydubs1.github.io/icegler-launch-ecommerce/**

Design direction: **"Shaped by light."** The site moves through one Icelandic day — the long blue dusk (hero), glacier daylight (shop), driftwood warmth (story), basalt night (footer). The brand's signature device is the **iceblock**: frames encased in a literal block of clear ice, built here entirely in CSS.

| Page | Direct link |
|------|-------------|
| Home | [/](https://meekydubs1.github.io/icegler-launch-ecommerce/) |
| Collection | [collection.html](https://meekydubs1.github.io/icegler-launch-ecommerce/collection.html) |
| Product | [product.html](https://meekydubs1.github.io/icegler-launch-ecommerce/product.html?frame=solstice&color=Glacier) |
| Lookbook | [lookbook.html](https://meekydubs1.github.io/icegler-launch-ecommerce/lookbook.html) |
| Story | [story.html](https://meekydubs1.github.io/icegler-launch-ecommerce/story.html) |
| Stores & Contact | [contact.html](https://meekydubs1.github.io/icegler-launch-ecommerce/contact.html) |
| Bag | [cart.html](https://meekydubs1.github.io/icegler-launch-ecommerce/cart.html) |
| Checkout | [checkout.html](https://meekydubs1.github.io/icegler-launch-ecommerce/checkout.html) |
| Foundations (design language) | [foundations.html](https://meekydubs1.github.io/icegler-launch-ecommerce/foundations.html) |

## What's inside

Hand-built static site — no framework, no build step, no external JS.

- `css/main.css` — the design system: brand tokens, Fraunces/Schibsted/Plex Mono type scale, components, and the CSS-only ice scenes (iceblock, aurora, ice fields, grain).
- `js/main.js` — shared chrome (nav, footer, cart drawer) injected on every page, a working localStorage cart, and the motion engine: scroll reveals, parallax, marquees, custom cursor, page transitions. Everything respects `prefers-reduced-motion`.
- `assets/`, `uploads/` — product photography and the original brand references (design system doc, client sketch, iceblock reference).

The cart, colorway switching, filters, and checkout flow are functional demos (client-side only — no orders are placed).

## Notes

- Design system source of truth: `uploads/icegler-design-system.md`.
- The previous Claude Design prototype handoff is preserved under the `design-v1` git tag.
