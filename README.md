# Ondrej Michal's Portfolio Website

This project is a personal portfolio website built using Astro, designed to showcase my skills and projects. It features a modern, responsive layout with a dark/light theme toggle for an enhanced user experience. The repo also hosts the Alexis Jonsson Modern Discord Theme, a custom CSS theme for Discord.


## Key Features

* **Responsive Design:** Adapts seamlessly to various screen sizes.
* **Dark/Light Theme Toggle:**  Users can switch between dark and light themes.
* **About Section:**  Provides a brief biography.
* **Skills Section:** Displays a list of my technical skills.
* **Projects Section:** Showcases my projects with titles, descriptions, and links.
* **Social Links:** Includes links to my social media profiles.
* **Clean and Minimalist Design:**  Emphasizes readability and a professional aesthetic.
* **Smooth Animations:** Uses CSS animations for enhanced user experience.


## Technologies Used

* **Astro:** Static site generator.
* **Tailwind CSS:**  CSS framework.
* **TypeScript:**  For type safety.
* **ESLint:**  JavaScript linter.
* **Prettier:**  Code formatter.



## Prerequisites

Before you can run this project, ensure you have the following installed:

* **Node.js and npm (or yarn):**  [https://nodejs.org/](https://nodejs.org/)  Astro requires Node.js to run its build process.  npm is Node's package manager, which is used to install project dependencies.


## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/onkofonko/onkofonko.github.io.git
   cd onkofonko.github.io
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Usage

To start the development server, run:

```bash
npm run dev
```

This will start a local server at `http://localhost:4321`.


To build the site for production, run:

```bash
npm run build
```

This will create a `dist` directory containing the built website files.


## Scripts

The `package.json` file contains the following scripts:

* `"dev"`: Starts the Astro development server.
* `"start"`: Alias for `dev`.
* `"build"`: Builds the Astro site for production.
* `"preview"`: Starts the Astro preview server for the built site.
* `"astro"`: Runs astro command
