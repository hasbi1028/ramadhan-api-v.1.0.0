# 🧪 Testing Guide - Buku Amaliah Ramadhan

**Panduan lengkap testing untuk memastikan kualitas aplikasi**

---

## 📋 Testing Overview

Aplikasi menggunakan **3 layers of testing**:

1. **Unit Tests** (Vitest) - Test individual functions
2. **Component Tests** (Vitest + Svelte Testing Library) - Test Svelte components
3. **E2E Tests** (Playwright) - Test complete user flows

---

## 🚀 Running Tests

### All Tests
```bash
bun run test
```

### Unit Tests Only
```bash
bun run test:unit
```

### Unit Tests (Watch Mode)
```bash
bun run test:unit --watch
```

### E2E Tests
```bash
bun run test:e2e
```

### E2E Tests (Headed - See Browser)
```bash
bun run test:e2e --headed
```

### E2E Tests (Specific File)
```bash
bun run test:e2e tests/auth.spec.ts
```

---

## 📁 Test Files Structure

```
amaliah/
├── src/
│   ├── lib/
│   │   ├── utils/
│   │   │   └── api.test.ts          # API client tests
│   │   ├── server/db/
│   │   │   └── index.test.ts        # Password functions tests
│   │   └── stores/
│   │       └── toast.store.test.ts  # Toast store tests
│   └── components/
│       └── *.test.ts                # Component tests (TODO)
└── tests/
    ├── auth.spec.ts                 # Authentication E2E tests
    ├── health.spec.ts               # Health check E2E tests
    ├── amaliah.spec.ts              # Amaliah E2E tests (TODO)
    └── wali.spec.ts                 # Wali E2E tests (TODO)
```

---

## ✅ Test Coverage

### Current Coverage

| Category | Tests | Status |
|----------|-------|--------|
| **Unit Tests** | 15+ | ✅ Good |
| - API Client | 8 | ✅ |
| - Password Functions | 7 | ✅ |
| - Toast Store | 10 | ✅ |
| **E2E Tests** | 8+ | ✅ Good |
| - Authentication | 7 | ✅ |
| - Health Check | 1 | ✅ |
| **Total** | **23+** | ✅ |

### Target Coverage

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| Unit Tests | 30+ | 25 | ⚠️ Need 5 more |
| E2E Tests | 20+ | 8 | ⚠️ Need 12 more |
| **Total** | **50+** | **33** | ⚠️ **66% Complete** |

---

## 📝 Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('My Function', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/feature');
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

---

## 🎯 Critical Test Scenarios

### Must Test (Priority 1)

#### Authentication
- [x] ✅ Login success
- [x] ✅ Login fail (wrong password)
- [x] ✅ Login fail (empty fields)
- [x] ✅ Logout
- [ ] ⏳ Register new user
- [ ] ⏳ Change password

#### Amaliah (Siswa)
- [ ] ⏳ Catat amaliah baru
- [ ] ⏳ Simpan amaliah
- [ ] ⏳ Parent verification
- [ ] ⏳ View rekap

#### Wali Kelas
- [ ] ⏳ Approve siswa
- [ ] ⏳ Reject siswa
- [ ] ⏳ View cek paraf
- [ ] ⏳ Reset verification

#### Admin
- [ ] ⏳ View dashboard
- [ ] ⏳ Create class
- [ ] ⏳ Delete user

### Should Test (Priority 2)

#### Validation
- [ ] ⏳ Input validation (empty fields)
- [ ] ⏳ Input validation (special characters)
- [ ] ⏳ XSS prevention
- [ ] ⏳ SQL injection prevention

#### Error Handling
- [ ] ⏳ Network error
- [ ] ⏳ API error (500)
- [ ] ⏳ Not found (404)
- [ ] ⏳ Unauthorized (401)

#### Edge Cases
- [ ] ⏳ Session expiry
- [ ] ⏳ Multiple tabs
- [ ] ⏳ Slow network
- [ ] ⏳ Offline mode

---

## 🔧 Test Utilities

### Mock Data

```typescript
// Test user data
const testUser = {
  id: 1,
  name: 'Test User',
  username: 'testuser',
  role: 'siswa' as const,
  kelas: '7A',
  verified: 1
};

// Test amaliah data
const testAmaliah = {
  checks: { sholat_subuh: true },
  pages: 5,
  catatan: 'Test catatan'
};
```

### Test Helpers

```typescript
// Login helper
async function login(page: Page, username: string, password: string) {
  await page.goto('/');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
}

// Create test user
function createTestUser(overrides = {}) {
  return { ...testUser, ...overrides };
}
```

---

## 🐛 Debugging Tests

### Verbose Output
```bash
bun run test:unit --reporter=verbose
```

### Specific Test
```bash
bun run test:unit -t "should login successfully"
```

### Debug Mode
```bash
bun run test:e2e --debug
```

### Screenshot on Failure
Already configured in `playwright.config.ts`

---

## 📊 Test Coverage Report

### Generate Coverage
```bash
bun run test:unit --coverage
```

### View Coverage Report
```bash
# Open in browser
open coverage/index.html
```

### Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Lines | 80% | TBD |
| Functions | 80% | TBD |
| Branches | 70% | TBD |

---

## 🚨 Common Issues

### Issue: Tests fail with "ReferenceError: localStorage is not defined"

**Solution:** Add mock in test setup
```typescript
// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});
```

### Issue: E2E tests fail with "Page is not defined"

**Solution:** Import Page from Playwright
```typescript
import { test, expect, type Page } from '@playwright/test';
```

### Issue: Tests hang indefinitely

**Solution:** Add timeout
```typescript
test('should complete', async ({ page }) => {
  test.setTimeout(30000); // 30 seconds
  // ... test code
});
```

---

## 🎯 Testing Best Practices

### DO ✅
- Write tests before fixing bugs (regression)
- Test one thing per test
- Use descriptive test names
- Mock external dependencies
- Test edge cases
- Keep tests fast and independent

### DON'T ❌
- Don't test implementation details
- Don't write flaky tests
- Don't skip tests without reason
- Don't test multiple things in one test
- Don't use real API calls in unit tests
- Don't share state between tests

---

## 📈 Test Metrics

### Speed Goals
- Unit tests: < 100ms per test
- Component tests: < 500ms per test
- E2E tests: < 10s per test

### Stability Goals
- Flaky tests: < 1%
- Pass rate: > 95%
- Coverage: > 80%

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Run unit tests
        run: bun run test:unit
      
      - name: Run E2E tests
        uses: playwright-test/playwright-test@v8
        with:
          command: bun run test:e2e
```

---

## 📞 Test Support

**Need help with testing?**
- 📖 [Vitest Documentation](https://vitest.dev/)
- 📖 [Playwright Documentation](https://playwright.dev/)
- 📖 [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/)

---

**🎉 Happy Testing!**
