# Waterloo Crypto — Black v0.1

This branch contains the original black Waterloo Crypto website.

## Website versions

| Website | GitHub branch | Live deployment |
| --- | --- | --- |
| White site | [`main`](../../tree/main) | [waterloo-crypto.vercel.app](https://waterloo-crypto.vercel.app/) |
| Black site | [`black-v01`](../../tree/black-v01) | [waterloo-crypto-v01.vercel.app](https://waterloo-crypto-v01.vercel.app/) |

Open black-site pull requests against `black-v01`. Open white-site pull requests against `main`.

## Main files

- `index.html` — homepage structure and content
- `styles.css` — page styling
- `main.js` — interactions
- `logo-chain-black.png` — black-background chain logo

## Run locally

This is a static site with no build step or dependencies.

```bash
python -m http.server 5173
```

Then open http://localhost:5173.
