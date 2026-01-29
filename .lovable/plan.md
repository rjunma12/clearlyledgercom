

# Plan: Fix Sign In Not Working - Missing Error Feedback

## Problem Identified
When users attempt to sign in (or sign up) and encounter an error, **no feedback is shown to the user**. The error is logged silently to the database, but the user sees:
1. Button shows "Signing in..." spinner
2. Spinner disappears
3. Nothing happens - no error message, stays on login page

This is because the code calls `logError()` (which is silent) but doesn't call `toast.error()` to show the user what went wrong.

## Root Cause
Both `Login.tsx` and `Signup.tsx` handle errors like this:
```typescript
if (error) {
  logError({ ... });  // Silent logging only
  // Missing: toast.error(error.message) to show feedback
}
```

The "silent error logging" approach was intended for non-blocking errors, but **authentication errors require immediate user feedback**.

## Solution
Add `toast.error()` calls alongside the silent logging so users see error messages like:
- "Invalid login credentials"
- "Email already registered"
- "Password must be at least 6 characters"

---

## Files to Modify

### 1. `src/pages/Login.tsx`
Add toast notifications for login errors:

**Current (lines 27-34):**
```typescript
if (error) {
  logError({
    errorType: ErrorTypes.AUTH,
    errorMessage: error.message,
    component: 'Login',
    action: 'signIn',
    metadata: { email }
  });
}
```

**After:**
```typescript
if (error) {
  // Show user-friendly error message
  toast.error(error.message || "Sign in failed. Please check your credentials.");
  
  logError({
    errorType: ErrorTypes.AUTH,
    errorMessage: error.message,
    component: 'Login',
    action: 'signIn',
    metadata: { email }
  });
}
```

Also add error handling in the catch block (lines 39-46).

### 2. `src/pages/Signup.tsx`
Add toast notifications for signup errors:

**Current (lines 30-37):**
```typescript
if (error) {
  logError({
    errorType: ErrorTypes.AUTH,
    errorMessage: error.message,
    component: 'Signup',
    action: 'signUp',
    metadata: { email }
  });
}
```

**After:**
```typescript
if (error) {
  // Show user-friendly error message
  toast.error(error.message || "Sign up failed. Please try again.");
  
  logError({
    errorType: ErrorTypes.AUTH,
    errorMessage: error.message,
    component: 'Signup',
    action: 'signUp',
    metadata: { email }
  });
}
```

Also add error handling in the catch block (lines 51-58).

---

## Changes Summary

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Add `toast.error()` for sign in failures |
| `src/pages/Signup.tsx` | Add `toast.error()` for sign up failures |

---

## Expected Result
After this fix:
1. User enters wrong credentials → sees "Invalid login credentials" toast
2. User tries to sign up with existing email → sees "User already registered" toast
3. User enters password too short → sees validation error toast
4. Silent logging to database continues in the background

