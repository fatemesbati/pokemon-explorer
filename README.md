# Pokémon Explorer App

A responsive React application built with TypeScript that allows users to browse and explore Pokémon using the PokéAPI.

## 🚀 Features

- **Pokémon List Page**: Paginated list of Pokémon with search functionality
- **Pokémon Detail Page**: Detailed view showing abilities, stats, types, and sprite
- **Responsive Design**: Mobile-first design using Material UI
- **Error Handling**: Comprehensive error boundaries and loading states
- **Type Safety**: Full TypeScript implementation
- **Testing**: Unit and integration tests with Jest and React Testing Library

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pokemon-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 🏗️ Build for Production

```bash
npm run build
```

## 📦 Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Material UI**: Component library and styling
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Jest & React Testing Library**: Testing framework

## 🎨 Project Structure

```
pokemon-explorer/
├── public/
├── src/
│   ├── components/
│   │   ├── PokemonList/
│   │   │   ├── PokemonList.tsx
│   │   │   ├── PokemonList.test.tsx
│   │   │   └── PokemonCard.tsx
│   │   ├── PokemonDetail/
│   │   │   ├── PokemonDetail.tsx
│   │   │   └── PokemonDetail.test.tsx
│   │   ├── ErrorBoundary/
│   │   │   └── ErrorBoundary.tsx
│   │   └── LoadingSpinner/
│   │       └── LoadingSpinner.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── api.test.ts
│   ├── types/
│   │   └── pokemon.ts
│   ├── App.tsx
│   ├── App.test.tsx
│   └── index.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Key Implementation Details

### API Integration
- Uses PokéAPI (https://pokeapi.co/) for all Pokémon data
- Implements pagination with 20 Pokémon per page
- Caching strategy to minimize API calls

### State Management
- React hooks (useState, useEffect) for local state
- URL parameters for pagination state

### Error Handling
- Error boundaries for runtime errors
- Try-catch blocks for API calls
- User-friendly error messages
- Retry mechanisms

### Performance Optimizations
- Lazy loading of images
- Debounced search
- Memoization of expensive computations
- Code splitting with React Router

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interface
- Accessible components

## 🎯 Features Implemented

✅ Paginated Pokémon list
✅ Pokémon detail page with abilities
✅ Pokémon sprites/images
✅ Back navigation
✅ Responsive design
✅ Error handling
✅ Loading states
✅ TypeScript types
✅ Unit tests
✅ Integration tests

## 🌟 Bonus Features

- Search functionality
- Type badges with colors
- Stats display with progress bars
- Smooth page transitions
- Keyboard navigation support
- Accessible ARIA labels

## 📝 API Endpoints Used

- `GET /pokemon?limit=20&offset=0` - List of Pokémon
- `GET /pokemon/{id or name}` - Pokémon details

## 🤝 Contributing

To contribute to this project, please invite `VladimirLi` and `mferno` as collaborators.

## 📄 License

MIT

## 👨‍💻 Author

Fateme - Master's Student in Petroleum Engineering at Sharif University of Technology
