
# 🍳 Smart Recipe Generator - AI-Powered Recipe App

![GitHub Stars](https://img.shields.io/github/stars/Dereje1/smart-recipe-generator?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Dereje1/smart-recipe-generator?style=social)
![License](https://img.shields.io/github/license/Dereje1/smart-recipe-generator)
![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-green)

**Smart Recipe Generator** is an **AI-powered web application** that uses **GPT-4** to generate unique recipes based on selected ingredients and dietary preferences, **DALL·E** to create custom recipe images, and **TTS** to narrate recipes. It's designed to make cooking easy, creative, and accessible for everyone.

🎥 **App Demo**

![Smart Recipe Generator Demo](./public/demo.gif)

🌐 **[Live Demo →](https://smart-recipe-generator.vercel.app/)**

---

## ⚡️ Key Features

### 🤖 **AI-Powered Features**
- **GPT-4 Recipe Generation**: Create unique recipes based on user-selected ingredients and dietary preferences.
- **DALL·E Image Generation**: Automatically generate high-quality images of the recipes.
- **Text-to-Speech (TTS)**: Narrate recipes aloud using AI-driven speech synthesis.
- **AI-Generated Tags**: Recipes are automatically tagged with relevant keywords for better searchability.
- **Context-Aware Chat Assistant**: Ask cooking-related questions about a recipe (e.g., substitutions, vegan options, prep time). Powered by GPT-4, limited to the context of each recipe.

### 📋 **Core Features**
- **User Authentication**: Secure login via Google OAuth using NextAuth.js.
- **Ingredient Selection**: Choose from a database of ingredients or add your own.
- **Dietary Preferences**: Support for vegan, gluten-free, keto, paleo, and more.
- **Recipe Management**: Like, save, and share recipes.
- **Infinite Scrolling**: Browse recipes seamlessly without pagination buttons.
- **Sort by Popularity or Newest**: View recipes sorted by likes or creation date.
- **Tag-Based Search**: Find recipes using AI-generated tags for ingredients and dietary relevance.
- **Notifications**: Get real-time updates on activity (likes, comments, etc.).
- **Mobile-Responsive UI**: Fully optimized for all devices.

---

## 🚀 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, MongoDB
- **AI Integration**: OpenAI GPT-4 for recipes, DALL·E for images, TTS for narration
- **Authentication**: NextAuth.js with Google OAuth
- **Cloud Storage**: AWS S3 for storing images and audio
- **Deployment**: Vercel

---

## 🛠️ Installation

### 1. **Clone the Repository**
```bash
git clone https://github.com/Dereje1/smart-recipe-generator.git
cd smart-recipe-generator
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Set Up Environment Variables**
Create a `.env.local` file and add:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
MONGO_URI=your-mongodb-uri
S3_BUCKET_NAME=your-s3-bucket-name
API_REQUEST_LIMIT=maximum-api-requests
```

### 4. **Run the Development Server**
```bash
npm run dev
```
App will be live at [http://localhost:3000](http://localhost:3000).

---

## 💡 Usage

1. **Log in** with Google.
2. **Select Ingredients** and **Dietary Preferences**.
3. **Generate Recipes** powered by **GPT-4**.
4. **View AI-Generated Images** and **Play Narrations**.
5. **Search Recipes** using AI-generated tags.
6. **Browse Recipes** with infinite scrolling and sorting by newest or most liked.
7. **Save, Like, and Share** your favorite recipes.
8. **Use the Chat Assistant** to ask follow-up questions about a recipe (e.g. substitutions, dietary changes, or cook time).

---

## 🧪 Testing & Building

### Unit Tests
Run Jest tests:
```bash
npm test
```
Generate a coverage report:
```bash
npm run coverage
```

### Compile TypeScript
Check the entire project for type errors:
```bash
npm run compileTS
```

### End-to-End Tests
Run all Cypress tests with the provided script which automatically starts the
development server:
```bash
npm run test:e2e
```
For the interactive UI:
```bash
npx cypress open
```

---

## 📊 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

### ⭐ **If you like this project, give it a star!**  
It helps more people discover it.

---

## 🏆 Acknowledgements
- [OpenAI](https://openai.com/)
- [Vercel](https://vercel.com/)
- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
