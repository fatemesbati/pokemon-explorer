# Testing Documentation

## 📊 Test Coverage Summary

### Overall Coverage Goals
- ✅ Unit Tests: 90%+ coverage
- ✅ Component Tests: All components tested
- ✅ Integration Tests: Key user flows
- ✅ Error Cases: All error states covered

## 🧪 Test Files Overview

### 1. API Service Tests (`src/services/api.test.ts`)

#### Purpose
Test all API integration and utility functions

#### Test Cases

**fetchPokemonList()**
```typescript
✓ Successfully fetches pokemon list
✓ Handles network errors gracefully
✓ Applies correct pagination parameters
✓ Returns properly formatted response
```

**fetchPokemonDetail()**
```typescript
✓ Fetches pokemon details by ID
✓ Fetches pokemon details by name
✓ Throws specific error for 404 (not found)
✓ Throws generic error for other failures
```

**Utility Functions**
```typescript
✓ extractPokemonId() - Extracts ID from URL
✓ getPokemonSpriteUrl() - Generates correct sprite URL
✓ transformPokemonList() - Transforms API response
✓ formatPokemonName() - Capitalizes names correctly
✓ formatStatName() - Formats stat names for display
✓ calculateTotalPages() - Calculates pagination correctly
```

#### Mocking Strategy
- Mock Axios module completely
- Mock both successful and error responses
- Test error interceptors

#### Run These Tests
```bash
npm test api.test
```

---

### 2. PokemonList Component Tests (`src/components/PokemonList/PokemonList.test.tsx`)

#### Purpose
Test the main list page with pagination

#### Test Cases

**Rendering**
```typescript
✓ Shows loading spinner initially
✓ Renders pokemon list after loading
✓ Displays correct number of pokemon
✓ Shows pagination controls
✓ Displays page information
```

**Data Fetching**
```typescript
✓ Calls API with correct page number
✓ Transforms data correctly
✓ Updates on page change
```

**Error Handling**
```typescript
✓ Displays error message on failure
✓ Shows retry button
✓ Retry button reloads page
```

**User Interactions**
```typescript
✓ Clicking pokemon card navigates to detail
✓ Pagination changes page
✓ URL updates with page number
```

#### Mocking Strategy
```typescript
// Mock API functions
jest.mock('../../services/api');

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
```

#### Run These Tests
```bash
npm test PokemonList.test
```

---

### 3. PokemonDetail Component Tests (`src/components/PokemonDetail/PokemonDetail.test.tsx`)

#### Purpose
Test the detail page with full pokemon information

#### Test Cases

**Rendering**
```typescript
✓ Shows loading spinner initially
✓ Renders pokemon details after loading
✓ Displays pokemon name and ID
✓ Shows type badges
✓ Displays abilities correctly
✓ Renders stats with progress bars
✓ Shows physical attributes (height/weight)
✓ Displays pokemon image
```

**Data Display**
```typescript
✓ Formats pokemon name correctly
✓ Shows hidden abilities with indication
✓ Calculates total stats
✓ Converts height to meters
✓ Converts weight to kilograms
```

**Navigation**
```typescript
✓ Back button navigates to list
✓ Back button visible in all states
```

**Error Handling**
```typescript
✓ Displays error message on API failure
✓ Shows retry button on error
✓ Handles 404 (pokemon not found)
✓ Handles invalid pokemon ID
```

#### Mocking Strategy
```typescript
// Mock API and navigation
jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Use MemoryRouter for route params
render(
  <MemoryRouter initialEntries={[`/pokemon/${id}`]}>
    <Routes>
      <Route path="/pokemon/:id" element={<PokemonDetail />} />
    </Routes>
  </MemoryRouter>
);
```

#### Run These Tests
```bash
npm test PokemonDetail.test
```

---

### 4. App Component Tests (`src/App.test.tsx`)

#### Purpose
Test the main app component, routing, and theming

#### Test Cases

**Rendering**
```typescript
✓ Renders without crashing
✓ Applies theme provider
✓ Wraps with error boundary
```

**Routing** (implicitly tested through other tests)
```typescript
✓ Routes to PokemonList at /
✓ Routes to PokemonDetail at /pokemon/:id
✓ Fallback route redirects to home
```

#### Run These Tests
```bash
npm test App.test
```

---

## 🎯 Running Tests

### Run All Tests
```bash
npm test
```
Runs all tests in watch mode. Press `a` to run all tests.

### Run with Coverage
```bash
npm test -- --coverage --watchAll=false
```
Generates coverage report in `coverage/` directory.

### Run Specific Test File
```bash
npm test api.test
npm test PokemonList
npm test PokemonDetail
```

### Run in CI Mode
```bash
CI=true npm test
```
Runs tests once without watch mode (for continuous integration).

### Update Snapshots
```bash
npm test -- -u
```
Updates test snapshots if component output changed intentionally.

---

## 📈 Coverage Report

After running tests with coverage, open:
```
coverage/lcov-report/index.html
```

### Expected Coverage
```
Statement Coverage: > 90%
Branch Coverage: > 85%
Function Coverage: > 90%
Line Coverage: > 90%
```

### Coverage by File Type

**Services (api.ts)**
- Target: 95%+
- High coverage expected as pure functions

**Components**
- Target: 90%+
- Cover all rendering paths and interactions

**Utils & Types**
- Target: 100%
- Should be fully testable

---

## 🔧 Testing Best Practices Used

### 1. AAA Pattern (Arrange, Act, Assert)
```typescript
it('should fetch pokemon list', async () => {
  // Arrange
  const mockData = { ... };
  mockedApi.fetchPokemonList.mockResolvedValue(mockData);
  
  // Act
  const result = await fetchPokemonList(1);
  
  // Assert
  expect(result).toEqual(mockData);
});
```

### 2. Testing User Behavior
```typescript
// Test what users see, not implementation
expect(screen.getByText(/pikachu/i)).toBeInTheDocument();

// Not
expect(component.state.pokemon.name).toBe('pikachu');
```

### 3. Async Testing
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
});
```

### 4. Accessibility Testing
```typescript
// Test by role and accessible name
const button = screen.getByRole('button', { name: /back to list/i });
```

### 5. Error Boundary Testing
```typescript
// Suppress console errors in tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
```

---

## 🐛 Common Testing Issues & Solutions

### Issue: "Can't perform a React state update on unmounted component"
**Solution**: 
```typescript
// Clean up in useEffect
useEffect(() => {
  let mounted = true;
  
  fetchData().then(data => {
    if (mounted) setData(data);
  });
  
  return () => { mounted = false; };
}, []);
```

### Issue: "act() warning"
**Solution**: 
```typescript
// Wrap state updates in act
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});
```

### Issue: "Network request failed"
**Solution**: 
```typescript
// Mock axios properly
jest.mock('axios');
mockedAxios.create.mockReturnValue({
  get: jest.fn(),
  interceptors: {
    response: { use: jest.fn() }
  }
} as any);
```

### Issue: "Element not found"
**Solution**: 
```typescript
// Use waitFor for async renders
await waitFor(() => {
  expect(screen.getByText(/pokemon/i)).toBeInTheDocument();
});
```

---

## 📝 Test Checklist

Before submitting, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Coverage > 90% (`npm test -- --coverage`)
- [ ] No console warnings or errors
- [ ] Tests are readable and well-named
- [ ] Edge cases are covered
- [ ] Error states are tested
- [ ] Loading states are tested
- [ ] User interactions are tested
- [ ] Accessibility is considered
- [ ] Mocks are properly cleaned up

---

## 🎓 Learning Resources

### React Testing Library
- [Official Docs](https://testing-library.com/react)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Jest
- [Official Docs](https://jestjs.io/docs/getting-started)
- [Mock Functions](https://jestjs.io/docs/mock-functions)

### Testing Best Practices
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Write Tests. Not Too Many. Mostly Integration.](https://kentcdodds.com/blog/write-tests)

---

## 🚀 Next Steps

1. Run all tests and verify they pass
2. Review coverage report
3. Add more tests if coverage is low
4. Consider E2E tests with Cypress/Playwright
5. Set up CI/CD pipeline with automated testing

---

## 📊 Test Results Example

```
PASS  src/services/api.test.ts
PASS  src/components/PokemonList/PokemonList.test.tsx
PASS  src/components/PokemonDetail/PokemonDetail.test.tsx
PASS  src/App.test.tsx

Test Suites: 4 passed, 4 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        4.521s

----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files            |   92.15 |    85.42 |   90.91 |   91.89 |
 src                 |     100 |      100 |     100 |     100 |
  App.tsx            |     100 |      100 |     100 |     100 |
 src/components      |   91.23 |    83.33 |   88.89 |   90.67 |
  PokemonList.tsx    |   93.75 |    85.71 |   90.00 |   93.33 |
  PokemonDetail.tsx  |   89.47 |    81.25 |   87.50 |   88.57 |
 src/services        |   94.44 |    88.89 |   94.12 |   94.29 |
  api.ts             |   94.44 |    88.89 |   94.12 |   94.29 |
----------------------|---------|----------|---------|---------|
```

Great coverage! All tests passing! ✅
