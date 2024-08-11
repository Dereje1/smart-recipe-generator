# Smart Recipe Generator

Smart Recipe Generator is an AI-powered web application that generates unique and delicious recipes based on user-selected ingredients and dietary preferences. It uses OpenAI for recipe generation and DALL-E for creating appetizing images of the recipes. The application is built using a MERN stack (MongoDB, React, Node.js) and deployed on Vercel.

## Features

- **User Authentication**: Secure login using Google OAuth with `next-auth`.
- **AI-Powered Recipe Generation**: Generate recipes based on selected ingredients and dietary preferences.
- **Recipe Image Generation**: Generate images of the recipes using DALL-E.
- **User Profiles**: View and manage your own recipes.
- **Likes System**: Like your favorite recipes.
- **Responsive Design**: Mobile-friendly and responsive UI.

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Node.js, MongoDB
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: OpenAI for recipe generation, DALL-E for image generation
- **Image Hosting**: AWS S3
- **Hosting**: Vercel

## Installation

#### Prerequisites

| Tool                                       | Version   | Required                         |
|------------------------------------------|---------|:-------------------------------:|
| [Node.js](https://nodejs.org/) / npm       | ~20.15.0 / ~10.7.0 | ✅ |
| [Git](https://git-scm.com/)                | ~2        | ✅ |
| [Docker Desktop](https://www.docker.com/products/docker-desktop) | ~4.4.2 | |
| [MongoDB Compass](https://www.mongodb.com/products/compass) | ~1.0.0 | |

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/Dereje1/smart-recipe-generator.git
    cd smart-recipe-generator
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Set Up Environment Variables**:
    Create a `.env.local` file in the root directory and add the following environment variables:
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-secret
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    OPENAI_API_KEY=your-openai-api-key
    AWS_ACCESS_KEY_ID=your-aws-access-key-id
    AWS_SECRET_KEY=your-aws-secret-key
    MONGO_URI=your-mongodb-uri
    S3_BUCKET_NAME=your-s3-bucket-name
    ```

    If you wish and have Docker, you can run MongoDB locally using:
    ```bash
    docker-compose up mongodb
    ```
    Point your MongoDB URI to:
    ```env
    mongodb://root:123456@localhost:27018
    ```

4. **Run the Development Server**:
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## Usage

1. **Sign In**: Log in using your Google account.
2. **Select Ingredients**: Choose ingredients from the list.
3. **Generate Recipes**: Click the button to generate recipes.
4. **Select Recipes**: Choose from the generated recipes to save into your account.
5. **View Recipes**: See the generated recipes and their images on the homepage.
6. **Like Recipes**: Like your favorite recipes.
7. **Profile**: View and manage your recipes in your profile.

## Deployment

The application is deployed on Vercel. Follow these steps to deploy:

1. **Login to Vercel**: If you don't have an account, sign up at [vercel.com](https://vercel.com/).
2. **Import Project**: Import your GitHub repository to Vercel.
3. **Configure Environment Variables**: Set the environment variables in Vercel's dashboard.
4. **Deploy**: Click on Deploy.

## Live Demo
Check out the live application [here](https://smart-recipe-generator.vercel.app/).

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [OpenAI](https://openai.com/)
- [Vercel](https://vercel.com/)
- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- Hat tip to anyone whose code was used
- GPT-4o for [acting as an assistant](https://github.com/Dereje1/smart-recipe-generator/blob/main/gpt.md) throughout the project

