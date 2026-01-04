# Pokémon Explorer App

A React + TypeScript implementation of the **Pokémon Explorer App** challenge, built according to the requirements defined in the Arkus-AI front-end assignment.

🔗 **Live Demo (Vercel)**  
https://pokemon-explorer-xi-ten.vercel.app/

> The application can be viewed directly in the browser on desktop or mobile without any local setup.

---

## 📌 Challenge Overview

This project was implemented as part of the **Front-End Intern Challenge** provided by Arkus-AI.

The task required building a small Pokémon explorer application using **React** and **TypeScript**, including:
- A Pokémon list page
- A Pokémon detail page
- API integration using PokéAPI
- Basic navigation and responsive styling

This solution fulfills all required criteria and includes additional enhancements to demonstrate front-end best practices.

---

## ✅ Implemented Features

### Pokémon List Page
- Paginated list of Pokémon
- Clickable items leading to detail page
- Responsive layout for desktop, tablet, and mobile

### Pokémon Detail Page
- Pokémon name and abilities
- Official artwork display
- Back navigation to list page

### API
- Data fetched from **PokéAPI**

---

## 🌟 Additional Enhancements

- **Global search** across all Pokémon
- **Favorites system** with persistence via `localStorage`
- **Evolution chain visualization**
- **Base stats visualization**
- **Scroll position memory**
- **Context-aware navigation** (list vs favorites)
- **Smooth animations and loading states**
- **Error boundaries** for graceful error handling

These additions showcase:
- Strong React component design
- Type-safe API integration
- UX-focused state management
- Clean and maintainable code structure

---

## 🛠️ Tech Stack

- **React 18**
- **TypeScript**
- **Material UI**
- **React Router**
- **Axios**
- **PokéAPI**

---

## 🧩 Project Structure

```

src/
├── components/        # UI components (List, Detail, Evolution, etc.)
├── services/          # API logic
├── types/             # TypeScript definitions
├── App.tsx            # Routing & layout
└── index.tsx          # Entry point

````

The codebase is modular, typed end-to-end, and structured for readability and scalability.

---

## ▶️ Local Setup

```bash
npm install
npm start
````

Access the app at:

```
http://localhost:3000
```

---

## 🎯 Design Decisions

* **Material UI**: Fast, accessible, consistent UI development
* **TypeScript**: End-to-end type safety
* **Favorites system**: Stored in `localStorage` to avoid backend complexity
* **Service layer**: API calls abstracted for maintainability

---

## 👤 Author

**Fateme Esbati**
Front-End / Software Engineer
Background in Computer Engineering
Interested in clean architecture, UX, and scalable front-end systems

---

## 📄 License

This project is created for demonstration and evaluation purposes.