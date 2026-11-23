
## <p align="center">SmartChef - AI-Powered Recipe App</p>

<p align="center"><img width="400" height="400" alt="SmartChef" src="https://github.com/user-attachments/assets/80ea10b4-e94b-4731-8d25-e76ee2209975"></p>



SmartChef is a privacy friendly fork of **Smart Recipe Generator**  that requires no accounts, authentication, syncing, or recipe sharing. It allows for local **OpenAI text models** to generate unique recipes based on selected ingredients and dietary preferences. These allow for the creation of offline "recipebooks" which then can be disciminated as the user sees fit.
---

## ⚡️ Key Features

### 🤖 **AI-Powered Features**
- **Configurable OpenAI Text Recipe Generation**: Create unique recipes based on user-selected ingredients and dietary preferences (default text model: `gpt-5-mini`).
- **OpenAI GPT Image Generation**: Automatically generate high-quality images of the recipes (default model: `gpt-image-1`).
- **Text-to-Speech (TTS)**: Narrate recipes aloud using AI-driven speech synthesis.
- **AI-Generated Tags**: Recipes are automatically tagged with relevant keywords for better searchability.
- **Context-Aware Chat Assistant**: Ask cooking-related questions about a recipe (e.g., substitutions, vegan options, prep time). Powered by the configurable OpenAI text model (default: `gpt-5-mini`), limited to the context of each recipe.

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
- **Backend**: Node.js, 
- **AI Integration**: Configurable OpenAI text model (default: `gpt-5-mini`) for text features, OpenAI GPT Image (`gpt-image-1`) for images, TTS for narration
- **Deployment**: Vercel

---

## 🛠️ Installation

### 1. **Clone the Repository**
```bash
git clone https://github.com/Dereje1/smart-recipe-generator.git
cd SmartChef
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Set Up Environment Variables**
Create a `.env.local` file and add:
```env

OPENAI_API_KEY=your-openai-api-key
OPENAI_TEXT_MODEL=gpt-5-mini
OPENAI_IMAGE_MODEL=gpt-image-1

```

### 4. **Run the Development Server**
```bash
npm run dev
```
App will be live at [http://localhost:3000](http://localhost:3000).

---

## 💡 Usage

1. **Launch App** 
2. **Select Ingredients** and **Dietary Preferences**.
3. **Generate Recipes** powered by the configurable **OpenAI text model** (default: **gpt-5-mini**).
4. **View AI-Generated Images** and **Play Narrations**.
5. **Search Recipes** using AI-generated tags.
6. **Browse Recipes** with infinite scrolling and sorting by newest or most liked.
7. **Use the Chat Assistant** to ask follow-up questions about a recipe (e.g. substitutions, dietary changes, or cook time).

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
