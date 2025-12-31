# 📝 BeyondChats Article Scraper & LLM Enhancer

A full-stack application that scrapes articles from BeyondChats blog, searches for related content on Google, and uses AI (Google Gemini) to enhance and update the original articles with improved formatting and content.

---

##  Acknowledgment!

I would like to express my sincere gratitude to **BeyondChats** for providing me with this amazing opportunity to work on this assignment. This project has been an incredible learning experience, allowing me to explore web scraping, API integrations, LLM implementations, and full-stack development. Thank you for the chance to showcase my skills and grow as a developer!

---

## 🚀 Live Demo

🔗 **Frontend**: [Live Link - Coming Soon](#)

---

## ✨ Features

- **Article Scraping**: Automatically scrapes the 5 oldest articles from BeyondChats blog
- **Google Search Integration**: Searches each article's title on Google and scrapes top 2 relevant results
- **AI-Powered Enhancement**: Uses Google Gemini LLM to update articles with improved formatting and content
- **Citation System**: Automatically adds references to source articles
- **Responsive UI**: Clean, professional frontend to view both original and updated articles
- **CRUD APIs**: Complete API endpoints for article management

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| Cheerio | HTML Parsing (BeyondChats) |
| JSDOM + Readability | Content Extraction (Google Results) |
| SerpAPI | Google Search API |
| Google Gemini | LLM for Content Enhancement |
| Axios | HTTP Client |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Library |
| Vite | Build Tool |
| Tailwind CSS v4 | Styling |
| React Router | Navigation |
| Axios | API Calls |

---

## 📊 Architecture / Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BeyondChats Article Pipeline                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   PHASE 1        │     │   PHASE 2        │     │   PHASE 3        │
│   Scrape Source  │────>│   Enhance with   │────>│   Display in     │
│                  │     │   LLM            │     │   Frontend       │
└──────────────────┘     └──────────────────┘     └──────────────────┘

                            DETAILED FLOW
                            ─────────────

    ┌─────────────────────┐
    │  BeyondChats Blog   │
    │  (Last 5 Articles)  │
    └──────────┬──────────┘
               │
               ▼ Cheerio Scraping
    ┌─────────────────────┐
    │  BeyondChatsBlog    │◀────────────────────────┐
    │  (MongoDB Schema)   │                          │
    └──────────┬──────────┘                          │
               │                                     │
               │ For each article title              │
               ▼                                     │
    ┌─────────────────────┐                          │
    │     SerpAPI         │                          │
    │  (Google Search)    │                          │
    └──────────┬──────────┘                          │
               │                                     │
               │ Top 2 URLs                          │
               ▼                                     │
    ┌─────────────────────┐                          │
    │  JSDOM + Readability│                          │
    │  (Content Scraping) │                          │
    └──────────┬──────────┘                          │
               │                                     │
               ▼                                     │
    ┌─────────────────────┐                          │
    │ GoogleScrapedArticle│                          │
    │  (MongoDB Schema)   │                          │
    └──────────┬──────────┘                          │
               │                                     │
               │ Original + References               │
               ▼                                     │
    ┌─────────────────────┐                          │
    │   Google Gemini     │                          │
    │   (LLM Processing)  │                          │
    └──────────┬──────────┘                          │
               │                                     │
               │ Enhanced Content                    │
               ▼                                     │
    ┌─────────────────────┐                          │
    │      Article        │     References           │
    │  (MongoDB Schema)   │──────────────────────────┘
    └──────────┬──────────┘
               │
               │ REST APIs
               ▼
    ┌─────────────────────┐
    │   React Frontend    │
    │  (Original + Updated│
    │     Articles)       │
    └─────────────────────┘
```

### Database Schema Relationships

```
┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│   BeyondChatsBlog   │       │ GoogleScrapedArticle│       │      Article        │
├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
│ _id                 │<───── │ beyondChat_article_ │       │ originalArticleId   │──┐
│ title               │  ref  │ _id                 │       │ referenceArticleIds │──┤
│ slug                │       │ sourceUrl           │<──────│ title               │  │
│ blogUrl             │       │ title               │  ref  │ contentHtml (LLM)   │  │
│ contentText         │       │ contentText         │       │ contentText (LLM)   │  │
│ contentHtml         │       │ contentHtml         │       │ citations           │  │
│ author              │       │ excerpt             │       └─────────────────────┘  │
│ tags                │       └─────────────────────┘                                │
└─────────────────────┘                                                              │
         ▲                                            ref                            │
         └───────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
beyondChatProject/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ArticleCard.jsx
│   │   │   └── Loader.jsx
│   │   ├── pages/                   # Page Components
│   │   │   ├── Home.jsx             # Updated Articles List
│   │   │   ├── OriginalArticles.jsx # Original Articles List
│   │   │   ├── ArticleDetail.jsx    # Updated Article View
│   │   │   └── OriginalArticleDetail.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios API Configuration
│   │   ├── App.jsx
│   │   └── index.css                # Tailwind Imports
│   └── package.json
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── controller/              # Route Controllers
│   │   │   ├── scraper.controller.js
│   │   │   ├── article.controller.js
│   │   │   └── originalArticle.controller.js
│   │   ├── model/                   # MongoDB Schemas
│   │   │   ├── beyondChatsBlog.model.js
│   │   │   ├── googleScrapedArticle.model.js
│   │   │   └── article.model.js
│   │   ├── route/                   # API Routes
│   │   │   ├── scraper.route.js
│   │   │   ├── article.route.js
│   │   │   └── originalArticle.route.js
│   │   ├── scripts/                 # Scraping & LLM Logic
│   │   │   ├── beyondChatScrape.js
│   │   │   ├── googleScrape.js
│   │   │   └── llmResult.js
│   │   ├── utils/                   # Utility Classes
│   │   ├── db/
│   │   │   └── index.js             # MongoDB Connection
│   │   ├── app.js                   # Express App Setup
│   │   └── index.js                 # Server Entry Point
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## ⚙️ Local Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas Account
- SerpAPI Account
- Google AI Studio Account

---

### 🔧 Backend Setup

#### Step 1: Navigate to Server Directory

```bash
cd server
```

#### Step 2: Create Environment File

Create a `.env` file in the `server` directory:

```bash
# Copy the example file
cp .env.example .env
```

Or manually create `.env` and copy contents from `.env.example`:

```env
PORT = 8000
MONGODB_URI=mongodb+srv://<db_name>:<db_passowrd>@cluster0.2w959aw.mongodb.net
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET = acCeSsToKeN-madeByHimansHuMisHRa
ACCESS_TOKEN_EXPIRY = 1d
REFRESH_TOKEN_SECRET = refREsHToKeN-madeByHimansHuMisHRa
REFRESH_TOKEN_EXPIRY = 10d
SERP_API_KEY= your_serp_api_key
GEMINI_API_KEY=your_gemini_api_key
```

#### Step 3: Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create an account or log in
3. Click **"New Project"** → Enter project name → Click **"Next"** → **"Create Project"**
4. Click **"Create Cluster"** → Select **FREE plan** → Click **"Create Deployment"**
5. A popup will appear:
   - Enter a **username**
   - Enter a **password** (⚠️ **Copy this password for later!**)
   - Click **"Create Database User"**
6. Click **"Choose a Connection Method"** → Select **"Compass"**
7. Copy the MongoDB connection string (looks like: `mongodb+srv://username:<db_password>@cluster0.xxxxx.mongodb.net`)
8. Paste it in your `.env` file as `MONGODB_URI`
9. Replace `<db_password>` with the password you copied earlier

#### Step 4: Configure SerpAPI

1. Go to [SerpAPI](https://serpapi.com/)
2. Click **"Register"** → Sign up with Google
3. Verify your email and phone number
4. Log in and go to your **Dashboard** (top right corner)
5. Find **"Your Private API Key"**
6. Copy the API key and paste it in `.env` as `SERP_API_KEY`

#### Step 5: Configure Google Gemini

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **"Get Started"** (top right)
3. From the left sidebar, navigate to **Dashboard** → **API Keys**
4. Create or copy your API key
5. Paste it in `.env` as `GEMINI_API_KEY`

#### Step 6: Install Dependencies & Run Server

```bash
npm install
npm run dev
```

✅ Server will start on **http://localhost:8000**

---

### 🎨 Frontend Setup

#### Step 1: Navigate to Client Directory

```bash
cd client
```

#### Step 2: Install Dependencies

```bash
npm install
```

Or if you face peer dependency issues:

```bash
npm install --force
```

#### Step 3: Environment Configuration (Optional)

For **local development**, no configuration is needed - it automatically uses `http://localhost:8000/api/v1`.


#### Step 4: Run Development Server

```bash
npm run dev
```

✅ Frontend will start on **http://localhost:5173**

---

## 🔄 How to Run the Scraping Pipeline

Use **Postman** or any API client to trigger the scraping process:

### Step 1: Scrape BeyondChats Articles

```
GET http://localhost:8000/api/v1/scraper/scrape-beyond-chats
```

This fetches the **5 oldest articles** from BeyondChats blog and stores them in `BeyondChatsBlog` collection.

### Step 2: Scrape Google for Related Articles

```
GET http://localhost:8000/api/v1/scraper/scrape-google-article
```

This searches each article's title on Google, scrapes the **top 2 relevant URLs**, and stores them in `GoogleScrapedArticle` collection.

### Step 3: Generate LLM-Enhanced Articles

```
GET http://localhost:8000/api/v1/scraper/llm-response
```

This calls **Google Gemini** to update each original article with improved formatting and content similar to the top-ranking Google results. Enhanced articles are stored in `Article` collection with citations.

⏳ **Note**: This step may take a few minutes as the LLM processes each article.

### Step 4: View Results

Open **http://localhost:5173** to see both:
- **Original Articles** - Scraped directly from BeyondChats
- **Updated Articles** - AI-enhanced versions with citations

---

## 📡 API Endpoints

### Scraper Routes (`/api/v1/scraper`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/scrape-beyond-chats` | Scrape 5 oldest BeyondChats articles |
| GET | `/scrape-google-article` | Search & scrape Google results |
| GET | `/llm-response` | Generate LLM-enhanced articles |

### Updated Articles Routes (`/api/v1/updated-articles`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/articles` | Get all LLM-updated articles |
| GET | `/article/:id` | Get updated article by ID (with references) |
| PUT | `/article/:id` | Update an article |
| DELETE | `/article/:id` | Delete an article |

### Original Articles Routes (`/api/v1/original-articles`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/articles` | Get all original BeyondChats articles |
| GET | `/article/:id` | Get original article by ID |
| PUT | `/article/:id` | Update original article |
| DELETE | `/article/:id` | Delete original article |

---

## 📸 Screenshots

### Home Page - Updated Articles
<img width="1901" height="874" alt="Screenshot 2025-12-31 200733" src="https://github.com/user-attachments/assets/5aeeeaf3-18fb-46de-91dd-2ca463ded210" />


### Original Articles
<img width="1896" height="877" alt="Screenshot 2025-12-31 200822" src="https://github.com/user-attachments/assets/3170c46a-e264-447d-8d60-3c587eb18cb5" />


### Article Detail View
<img width="1903" height="881" alt="Screenshot 2025-12-31 200853" src="https://github.com/user-attachments/assets/12d7e283-6297-4ff8-9307-27cd28b833ce" />


---

## 🎯 Assignment Completion Checklist

### Phase 1 ✅
- [x] Scrape 5 oldest articles from BeyondChats blog
- [x] Store articles in MongoDB database
- [x] Create CRUD APIs for articles

### Phase 2 ✅
- [x] Search article titles on Google using SerpAPI
- [x] Scrape top 2 relevant articles from Google results
- [x] Call LLM (Google Gemini) to enhance original articles
- [x] Make formatting/content similar to top-ranking articles
- [x] Add citations for reference articles at the bottom

### Phase 3 ✅
- [x] Create React frontend with responsive UI
- [x] Display both original and updated articles
- [x] Professional, clean design with Tailwind CSS

---

## 👨‍💻 Author

**Himanshu Mishra**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## Thank You!

Thank you **BeyondChats** for this wonderful opportunity. It was an amazing experience building this project!
