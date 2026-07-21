# Versus - Frontend

This is the React frontend for the Versus application, built with **Vite**.

## Environments
The application is configured to connect to 3 distinct backend environments:
- **Development**: Uses `.env.development` (points to `localhost:3000`)
- **Test**: Uses `.env.test` (points to the test API Gateway)
- **Production**: Uses `.env.production` (points to the production API Gateway)

*The base URLs are injected into the React app using `import.meta.env.VITE_API_URL`.*

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in the development mode (defaults to `.env.development`).
You can explicitly specify an environment to test against a remote backend locally:
- `npm run dev:test`
- `npm run dev:production`

### Building for Deployment (Amazon S3)
To build the app for a specific environment, run the corresponding build script:
- `npm run build:dev`
- `npm run build:test`
- `npm run build:production`

This will generate a `dist` folder. To deploy to S3, simply upload the **contents** of the `dist` folder into your configured S3 bucket.
