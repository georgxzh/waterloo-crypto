# Waterloo Crypto

The cryptographic society of the University of Waterloo.

## Website versions

| Website | GitHub branch | Live deployment | Purpose |
| --- | --- | --- | --- |
| White site | [`main`](../../tree/main) | [waterloo-crypto.vercel.app](https://waterloo-crypto.vercel.app/) | Current minimal website and active development |
| Black site | [`black-v01`](../../tree/black-v01) | [waterloo-crypto-v01.vercel.app](https://waterloo-crypto-v01.vercel.app/) | Preserved original dark v0.1 concept |

Start new work from the branch for the website you intend to change. Pull requests should clearly say **white site** or **black site** in the title so changes do not get mixed together.

## Main files

- `index.html` — homepage structure and content
- `styles.css` — page styling
- `main.js` — interactions
- `research.html` and `research.js` — research section
- Image and SVG files — logos, portraits, and hero artwork

## Run locally

The site is static and has no build step or dependencies:

```bash
python -m http.server 5173
```

Then open [http://localhost:5173](http://localhost:5173).
