ReactJS Project — Local Development Guide
📋 Overview

This document explains how to set up and run the ReactJS project locally for development.

🔧 Prerequisites

Before starting, make sure you have the following installed:

Node.js — preferably the latest LTS version.
npm — included with Node.js.
Git — required to clone the repository.

You can verify your installations with:

node --version
npm --version
git --version

📥 1. Clone the Repository

Clone the project from GitHub:

git clone https://github.com/Ibtissam-Elharrachi/test-repo.git


Then navigate into the project directory:

cd test-repo

📦 2. Install Dependencies

Install all required project dependencies:

npm install


This will install the packages defined in package.json and generate/update the node_modules directory.

🔐 3. Configure Environment Variables

The project requires environment variables to run correctly.

A .env.example file is included in the project as a template.

Create your local .env file from the example:

cp .env.example .env

Windows

If the command above doesn't work, you can manually copy .env.example and rename the copy to:

.env

⚠️ Important

The .env.example file contains placeholders only.

Open the newly created .env file and replace each placeholder with the appropriate value for your local environment.

For example:

VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_PUBLISHABLE_KEY=SUPABASE_API_KEY

⚠️ NOTE from (Mounir): "mli twsli lhna sifti lia nsift lik SUPABASE API Keys";


Replace the placeholder values with the actual values provided by the project administrator or development team.

Do not commit the .env file to GitHub.

The .env file may contain sensitive credentials or environment-specific configuration. Only .env.example should be committed to the repository.

🚀 4. Start the Development Server

Once the dependencies and environment variables are configured, start the application:

npm run dev


The terminal should display a local URL, usually similar to:

http://localhost:5173


Open the displayed URL in your browser.

🛑 5. Stop the Development Server

To stop the development server, press:

Ctrl + C


in the terminal.

🏗️ 6. Build the Project

To create a production build:

npm run build


The generated production files will typically be placed in the dist/ directory.

🔍 7. Preview the Production Build

After building the project, you can preview the production version locally:

npm run preview
