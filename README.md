# Pokémon Explorer App

A modern, feature-rich Pokémon explorer application built with React and TypeScript. Browse, search, and favorite your favorite Pokémon with a beautiful, responsive interface.

## 🚀 Live Demo

Open `http://localhost:3000` after running `npm start`

## ✨ Features

### Core Features
- ✅ **Paginated Pokémon List** - Browse 1,300+ Pokémon with smooth pagination
- ✅ **Detailed Pokémon View** - Comprehensive information for each Pokémon
- ✅ **Official Artwork** - High-quality Pokémon images
- ✅ **Responsive Design** - Perfect on mobile, tablet, and desktop
- ✅ **Full TypeScript** - Complete type safety throughout

### Advanced Features
- 🔍 **Global Search** - Search across ALL Pokémon from any page
- ❤️ **Favorites System** - Save and manage your favorite Pokémon
- 🔗 **Evolution Chains** - View and navigate evolution stages
- 📊 **Stats Visualization** - Interactive progress bars for base stats
- 🎨 **Type Badges** - Color-coded Pokémon type indicators
- ⚡ **Loading States** - Smooth transitions with background loading
- 🎭 **Smooth Animations** - Card entrance animations and transitions
- 📍 **Scroll Memory** - Returns to exact scroll position when navigating back
- 🎯 **Smart Navigation** - Context-aware back button (remembers if you were in Favorites)

## 🛠️ Technologies Used

- **React 18.2.0** - Modern React with hooks
- **TypeScript 4.9.5** - Full type safety
- **Material-UI 5.14.16** - Professional UI components
- **React Router 6.18.0** - Client-side routing
- **Axios 1.6.0** - HTTP client
- **PokéAPI** - Pokémon data source
- **Jest & React Testing Library** - Comprehensive testing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🏗️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pokemon-explorer
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🧪 Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test PokemonList
```

## 🏗️ Build for Production
```bash
npm run build
```

Creates optimized production build in the `build/` folder.

## 📁 Project Structure
```
pokemon-explorer/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── PokemonList/
│   │   │   ├── PokemonList.tsx          # Main list page with search/favorites
│   │   │   ├── PokemonList.test.tsx     # List component tests
│   │   │   └── PokemonCard.tsx          # Individual Pokémon card
│   │   ├── PokemonDetail/
│   │   │   ├── PokemonDetail.tsx        # Detailed Pokémon view
│   │   │   └── PokemonDetail.test.tsx   # Detail component tests
│   │   ├── EvolutionChain/
│   │   │   └── EvolutionChain.tsx       # Evolution chain display
│   │   ├── ErrorBoundary/
│   │   │   └── ErrorBoundary.tsx        # Error handling wrapper
│   │   └── LoadingSpinner/
│   │       └── LoadingSpinner.tsx       # Loading state component
│   ├── services/
│   │   ├── api.ts                       # API integration & favorites
│   │   └── api.test.ts                  # API tests
│   ├── types/
│   │   └── pokemon.ts                   # TypeScript type definitions
│   ├── App.tsx                          # Main app with routing
│   ├── App.test.tsx                     # App tests
│   └── index.tsx                        # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🎮 How to Use

### Browsing Pokémon
1. **View All Pokémon** - Default view shows paginated list
2. **Search** - Type any Pokémon name to search across all pages
3. **Navigate** - Click any Pokémon card to view details
4. **Paginate** - Use pagination controls at bottom

### Favorites
1. **Add to Favorites** - Click the heart icon on any card
2. **View Favorites** - Toggle "Favorites" button at top
3. **Search Favorites** - Search works within favorites too
4. **Remove Favorites** - Click heart again to remove

### Evolution Chains
1. **View Evolution** - Shown on detail page (if available)
2. **Navigate Evolution** - Click any evolution stage to view it
3. **Current Highlight** - Your current Pokémon is highlighted

### Navigation
1. **Back Button** - Always returns to where you came from
2. **Scroll Position** - Returns to exact scroll position
3. **Context Aware** - Remembers if you were in Favorites or on specific page

## 🎨 Key Features Explained

### 1. Global Search
- Searches across **all 1,300+ Pokémon**
- Works with spaces ("mr mime") or hyphens ("mr-mime")
- Instant filtering with 300ms debounce
- Shows results from any page

### 2. Favorites System
- Stored in **localStorage** (persists across sessions)
- Toggle button shows count
- Separate view for favorites only
- Search within favorites

### 3. Evolution Chains
- Automatically fetched for each Pokémon
- Shows all evolution stages
- Click to navigate between evolutions
- Displays evolution level requirements

### 4. Smart Navigation
- Back button remembers context (Favorites/All/Page)
- Scroll position restored exactly
- Smooth scroll animations
- URL-based state management

### 5. Smooth UX
- Background loading (no content flash)
- Card entrance animations
- Staggered fade-in effect
- Loading overlays

## 🎯 API Usage

All data fetched from [PokéAPI](https://pokeapi.co/)

**Endpoints used:**
- `GET /pokemon?limit=20&offset=0` - Pokémon list
- `GET /pokemon/{id}` - Pokémon details
- `GET /pokemon-species/{id}` - Species data (for evolution)
- `GET /evolution-chain/{id}` - Evolution chain

## 🔧 Configuration

### Pagination
Change items per page in `src/services/api.ts`:
```typescript
const ITEMS_PER_PAGE = 20; // Modify this value
```

### Theme
Customize theme in `src/App.tsx`:
```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#EE1515' },
    secondary: { main: '#3B4CCA' },
  },
});
```

## 📊 Performance Optimizations

- **Lazy Loading** - Images load on demand
- **Debounced Search** - Prevents excessive filtering
- **Background Loading** - Smooth page transitions
- **localStorage** - Favorites cached locally
- **Memoization** - Optimized re-renders
- **Code Splitting** - React Router lazy loading

## ♿ Accessibility Features

- **Keyboard Navigation** - Full keyboard support
- **ARIA Labels** - Screen reader friendly
- **Focus Indicators** - Clear focus states
- **Alt Text** - All images have descriptions
- **Color Contrast** - WCAG AA compliant
- **Touch Targets** - 44x44px minimum

## 🐛 Known Issues & Solutions

**Issue: Slow initial load**
- Solution: App loads all Pokémon names for search (one-time)

**Issue: Favorites not syncing across tabs**
- Solution: Use localStorage events (future enhancement)

## 🚀 Future Enhancements

- [ ] Advanced filters (by type, generation, stats)
- [ ] Sort options (alphabetical, by stats, by type)
- [ ] Comparison tool (compare 2+ Pokémon)
- [ ] Team builder (create teams of 6)
- [ ] Move details (show Pokémon moves)
- [ ] Shiny variants toggle
- [ ] Export favorites as JSON
- [ ] PWA support (offline mode)
- [ ] Dark mode toggle
- [ ] Pokédex completion tracker

## 🤝 Contributing

To contribute:
1. Invite `VladimirLi` and `mferno` as collaborators
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📝 Testing Coverage
```
Test Suites: 4 passed
Tests: 32+ passed
Coverage: >90% across all modules

Files:
- api.ts: 95%+
- Components: 90%+
- Types: 100%
```

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Docs](https://mui.com/)
- [PokéAPI Documentation](https://pokeapi.co/docs/v2)

## 📄 License

MIT License

## 👨‍💻 Author

**Fateme**
- Master's Student in Petroleum Engineering
- Sharif University of Technology
- Specializing in HPC and Computational Methods

## 🙏 Acknowledgments

- PokéAPI for comprehensive Pokémon data
- Material-UI for beautiful components
- React community for excellent tools and libraries

---

**Built with ❤️ using React + TypeScript**