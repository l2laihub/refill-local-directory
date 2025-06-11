# RefillLocal

RefillLocal is a web application that helps users find refill and zero-waste stores near them. It provides a directory of eco-conscious shops, allowing users to shop plastic-free and live more sustainably.

## Features

- **Search by City**: Find stores in your local area.
- **Store Listings**: View detailed information about each store, including hours, specialties, and what to bring.
- **Community-Powered**: The directory is built and maintained by a community of conscious consumers.
- **Waitlist**: Sign up to be notified when the service launches in your city.

## Tech Stack

- **Vite**: A fast build tool for modern web projects.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Lucide React**: A library of beautiful and consistent icons.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username/refill-local.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Start the development server
   ```sh
   npm run dev
   ```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Deployment

This project is set up for automatic deployment using Netlify CI/CD pipeline. Here's how the deployment process works:

### CI/CD Pipeline

- **GitHub Actions**: The project uses GitHub Actions for continuous integration and delivery.
- **Netlify Integration**: Deployments are handled through Netlify with automatic preview deployments for pull requests.

### Setting Up Netlify Deployment

1. **Create a Netlify account** and connect your GitHub repository
2. **Configure environment variables** in Netlify:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_POSTHOG_KEY`: Your PostHog API key
   - `VITE_RESEND_API_KEY`: Your Resend email API key

3. **Set up GitHub secrets** for GitHub Actions:
   - `NETLIFY_AUTH_TOKEN`: Generate from Netlify user settings
   - `NETLIFY_SITE_ID`: Find in your Netlify site settings

### Manual Deployment

You can also deploy manually:

```sh
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## License

Distributed under the MIT License. See `LICENSE` for more information.
