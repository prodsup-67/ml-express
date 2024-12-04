# Teachable Machine Model Server

## Get started

- `pnpm install`
- `pnpm run build`
- `pnpm run start`
  - The default port `3003`.

## Production

- Change `SERVER_URL` in `.env` to match your production url.
  - The app will need this url to load model.(This is because I am using client-side `tfjs` so the model needs to be loaded from http protocol.)
