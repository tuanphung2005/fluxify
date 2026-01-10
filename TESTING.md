# Testing Guide

## Test Structure

The project uses **two test runners** for different types of tests:

### 1. **Bun Test** - Business Logic & Unit Tests
Fast, lightweight tests for pure business logic without React components.

**Files:**
- `tests/edge-cases.test.ts` - Edge case scenarios (37 tests)
- `tests/session-features.test.ts` - Feature tests (27 tests)
- `tests/order-display.test.ts` - Order display logic (9 tests)

**Total: 73 tests**

### 2. **Vitest** - Component Tests
Tests for React components with mocking and DOM testing.

**Files:**
- `tests/components/*.test.tsx` - Component integration tests

## Running Tests

### Run All Tests
```bash
npm run test
```
This runs both unit tests (Bun) and component tests (Vitest).

### Run Only Business Logic Tests (Fast)
```bash
npm run test:unit
```
Runs 73 tests in ~65ms using Bun.

### Run Only Component Tests
```bash
npm run test:components
```
Runs component tests using Vitest.

### Run Tests in Watch Mode
```bash
vitest
```
For component development with hot reload.

### Run Tests with UI
```bash
npm run test:ui
```
Opens Vitest UI for interactive testing.

### Run Tests with Coverage
```bash
npm run test:coverage
```
Generates code coverage report.

## Test Coverage

### Business Logic Tests (73 tests, 101+ assertions)

#### Variant Stock Management
- ✅ Variant key generation and consistency
- ✅ Stock calculation across variant combinations
- ✅ Availability checks
- ✅ Zero stock scenarios
- ✅ Negative stock handling
- ✅ Large numbers (999,999+)

#### Order & Buyer Information
- ✅ Display logic with fallbacks (fullName → user.name → "Khách")
- ✅ Phone number validation (Vietnamese format: 0xxxxxxxxx)
- ✅ Name validation and edge cases
- ✅ Null/undefined value handling

#### Vietnamese Formatting
- ✅ Currency formatting (VND with separators: 123.456₫)
- ✅ Decimal amounts
- ✅ Large amounts (999.999.999₫)
- ✅ Zero and negative amounts

#### VietQR Integration
- ✅ Amount handling (no multiplication)
- ✅ Minimum 1000 VND enforcement
- ✅ Decimal rounding
- ✅ Edge cases (0, negative, exactly 1000)

#### Cart Operations
- ✅ Variant-based item distinction
- ✅ Quantity validation (0, large numbers, exceeding stock)
- ✅ Multiple variants of same product
- ✅ Unique key generation

#### Stock Deduction
- ✅ Variant-specific deduction
- ✅ Preventing negative stock
- ✅ Exact stock match
- ✅ Multiple order handling

#### Special Characters & Edge Cases
- ✅ Vietnamese diacritics (Đỏ, Lớn, Màu sắc)
- ✅ Spaces in variant values
- ✅ Malformed variant keys
- ✅ Missing/invalid data
- ✅ Empty objects

## Best Practices

### When to Use Bun Tests
- Pure functions (no React)
- Business logic
- Data transformations
- Validation logic
- Fast iteration needed

### When to Use Vitest
- React components
- DOM interactions
- Component integration
- Mocking external dependencies

## Quick Reference

```bash
# Development workflow
npm run test:unit          # Quick check (65ms)
npm run test              # Full test suite
vitest                    # Watch mode for components

# CI/CD
npm run test              # Run all tests
npm run test:coverage     # Generate coverage
```

## Test Results

**Current Status:**
- ✅ 73/73 business logic tests passing
- ✅ 101+ assertions
- ✅ ~65ms execution time
- ✅ 0 failures

All features implemented in this session are fully tested with comprehensive edge case coverage!
