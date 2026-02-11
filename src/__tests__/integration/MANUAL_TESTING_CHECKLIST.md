# Firebase Auth Integration - Manual Testing Checklist

**Version**: 1.0  
**Last Updated**: 2026-02-10  
**Test Environment**: Production (mealsMe app)

---

## Overview

This checklist provides step-by-step instructions for manually verifying all Firebase Authentication integration acceptance criteria. Each test follows the **AAA pattern** (Arrange, Act, Assert) for clarity and consistency.

**Coverage Goals**:
- ✅ Critical paths: 100% (auth, data persistence, logout)
- ✅ Happy paths: All covered
- ✅ Error cases: Key error scenarios covered

---

## Prerequisites

Before starting tests, ensure:
- [ ] App is deployed and accessible at production URL
- [ ] Firebase project is configured correctly
- [ ] Firestore security rules are deployed
- [ ] You have a Google account for testing
- [ ] Browser DevTools are open (Console + Network tabs)
- [ ] Browser cache is cleared (for fresh start)

---

## Test Suite 1: Authentication Flow

### Test 1.1: Unauthenticated User Redirected to /login

**Objective**: Verify that unauthenticated users cannot access protected routes

**Priority**: Critical  
**Expected Result**: User is redirected to /login page

#### Steps:

**Arrange**:
1. Open browser in incognito/private mode
2. Clear all cookies and local storage
3. Open DevTools Console

**Act**:
4. Navigate to `https://[your-domain]/mealsMe/`
5. Observe the URL and page content

**Assert**:
- [ ] URL automatically changes to `/mealsMe/login`
- [ ] Login page is displayed with "Entrar com Google" button
- [ ] No error messages in console
- [ ] No protected content is visible

**Additional Checks**:
6. Try accessing `/mealsMe/finance` directly
   - [ ] Redirects to `/mealsMe/login`
7. Try accessing `/mealsMe/settings` directly
   - [ ] Redirects to `/mealsMe/login`

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
Date tested: ___________
Tester: ___________
Browser: ___________
Issues found: ___________
```

---

### Test 1.2: Authenticated User Can Access All Pages

**Objective**: Verify that authenticated users can access all protected routes

**Priority**: Critical  
**Expected Result**: User can navigate to all pages without redirects

#### Steps:

**Arrange**:
1. Open browser in incognito/private mode
2. Navigate to `/mealsMe/login`
3. Click "Entrar com Google"
4. Complete Google OAuth login
5. Wait for redirect to home page

**Act & Assert**:

**Home Page Access**:
6. Verify URL is `/mealsMe/`
   - [ ] Home page loads successfully
   - [ ] User is not redirected to login
   - [ ] Bottom navigation is visible

**Finance Routes**:
7. Navigate to `/mealsMe/finance`
   - [ ] Finance dashboard loads
   - [ ] No redirect to login
   - [ ] User data is visible

8. Navigate to `/mealsMe/finance/add-expense`
   - [ ] Add expense page loads
   - [ ] No redirect to login

9. Navigate to `/mealsMe/finance/history`
   - [ ] History page loads
   - [ ] No redirect to login

10. Navigate to `/mealsMe/finance/budget`
    - [ ] Budget page loads
    - [ ] No redirect to login

**Settings Route**:
11. Navigate to `/mealsMe/settings`
    - [ ] Settings page loads
    - [ ] User profile is displayed (name, email, avatar)
    - [ ] No redirect to login

**Console Checks**:
12. Check DevTools Console
    - [ ] No authentication errors
    - [ ] No permission denied errors

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
Date tested: ___________
Tester: ___________
Browser: ___________
Issues found: ___________
```

---

### Test 1.3: User Profile Created on First Login

**Objective**: Verify that user profile is automatically created in Firestore on first login

**Priority**: Critical  
**Expected Result**: User profile document exists in Firestore after first login

#### Steps:

**Arrange**:
1. Open Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Note the current number of user documents
4. Open app in incognito mode
5. Ensure you're using a Google account that has NEVER logged in before

**Act**:
6. Navigate to `/mealsMe/login`
7. Click "Entrar com Google"
8. Complete Google OAuth login with NEW account
9. Wait for redirect to home page
10. Open DevTools Console and look for profile creation logs

**Assert**:

**Firestore Verification**:
11. Refresh Firebase Console → Firestore Database
    - [ ] New document exists in `users/{userId}/profile/data`
    - [ ] Document contains `email` field (matches Google account)
    - [ ] Document contains `displayName` field
    - [ ] Document contains `photoURL` field
    - [ ] Document contains `createdAt` timestamp
    - [ ] Document contains `lastLogin` timestamp
    - [ ] `createdAt` and `lastLogin` are approximately the same time

**Console Verification**:
12. Check DevTools Console
    - [ ] No errors related to profile creation
    - [ ] Profile creation succeeded silently (or with success log)

**App Verification**:
13. Navigate to `/mealsMe/settings`
    - [ ] User name is displayed correctly
    - [ ] User email is displayed correctly
    - [ ] User avatar is displayed (if available from Google)

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
Date tested: ___________
Tester: ___________
Google account used: ___________
User ID created: ___________
Issues found: ___________
```

---

## Test Suite 2: Data Persistence

### Test 2.1: Daily Progress Saved to Firestore

**Objective**: Verify that daily progress data is correctly saved to Firestore

**Priority**: Critical  
**Expected Result**: Progress data persists in Firestore and survives page reload

#### Steps:

**Arrange**:
1. Login to the app (use existing account)
2. Navigate to home page `/mealsMe/`
3. Open Firebase Console → Firestore Database
4. Navigate to `users/{your-userId}/dailyProgress`
5. Note current documents (if any)
6. Open DevTools Console and Network tab

**Act**:
7. On the home page, interact with daily progress features:
   - Click the floating water button to add water (e.g., +250ml)
   - Mark a meal as completed
   - Add any other trackable progress

8. Wait 2-3 seconds for Firestore sync

**Assert**:

**Firestore Verification**:
9. Refresh Firebase Console → Firestore Database
   - [ ] Document exists at `users/{userId}/dailyProgress/{YYYY-MM-DD}`
   - [ ] Document contains `waterMl` field with correct value
   - [ ] Document contains meal completion data
   - [ ] Data matches what was entered in the UI

**Network Verification**:
10. Check DevTools Network tab
    - [ ] Firestore write requests are visible
    - [ ] No failed requests (status 200/204)
    - [ ] No permission denied errors

**Persistence Verification**:
11. Refresh the page (F5)
    - [ ] Progress data is still visible
    - [ ] Water count matches previous value
    - [ ] Meal completions are preserved

12. Close browser tab and reopen app
    - [ ] Progress data is still visible
    - [ ] All data persists correctly

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
Date tested: ___________
Tester: ___________
Water value tested: ___________
Document path: ___________
Issues found: ___________
```

---

### Test 2.2: Real-time Sync Works (onSnapshot)

**Objective**: Verify that Firestore real-time sync updates UI automatically

**Priority**: Critical  
**Expected Result**: UI updates automatically when Firestore data changes

#### Steps:

**Arrange**:
1. Login to the app
2. Navigate to home page `/mealsMe/`
3. Open Firebase Console → Firestore Database in a separate window
4. Navigate to `users/{your-userId}/dailyProgress/{today's-date}`
5. Open DevTools Console

**Act**:
6. In Firebase Console, manually edit the `waterMl` field:
   - Change value to a different number (e.g., 1500)
   - Click "Update"

7. Immediately switch back to the app window (do NOT refresh)

**Assert**:

**Real-time Update Verification**:
8. Observe the app UI
   - [ ] Water count updates automatically (within 1-2 seconds)
   - [ ] No page refresh required
   - [ ] New value matches Firestore value (1500ml)

**Console Verification**:
9. Check DevTools Console
   - [ ] No errors related to Firestore listener
   - [ ] Listener is active and receiving updates

**Multiple Field Test**:
10. In Firebase Console, edit another field (e.g., add a meal completion)
    - [ ] UI updates automatically
    - [ ] Changes reflect immediately

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
Date tested: ___________
Tester: ___________
Sync delay observed: ___________
Issues found: ___________
```

---

## Test Suite 3: Logout Flow

### Test 3.1: Logout Clears Cache and Redirects to /login

**Objective**: Verify that logout properly clears all cached data and redirects user

**Priority**: Critical  
**Expected Result**: User is logged out, cache cleared, and redirected to login page

#### Steps:

**Arrange**:
1. Login to the app
2. Navigate to home page and add some progress data (water, meals)
3. Navigate to `/mealsMe/settings`
4. Open DevTools → Application tab → IndexedDB
5. Expand `firebaseLocalStorageDb` to see cached data
6. Open DevTools Console

**Act**:
7. Click "Sair da Conta" (Logout) button
8. Observe the logout process

**Assert**:

**UI Verification**:
9. During logout:
   - [ ] Button shows loading state ("Saindo...")
   - [ ] Button is disabled during logout
   - [ ] Loading spinner is visible

10. After logout:
    - [ ] URL changes to `/mealsMe/login`
    - [ ] Login page is displayed
    - [ ] No user data is visible

**Cache Verification**:
11. Check DevTools → Application → IndexedDB
    - [ ] `firebaseLocalStorageDb` is cleared or empty
    - [ ] No cached Firestore data remains

12. Check DevTools → Application → Local Storage
    - [ ] Firebase auth tokens are cleared
    - [ ] No user session data remains

**Console Verification**:
13. Check DevTools Console
    - [ ] "✅ Firestore cache cleared" message appears (or similar)
    - [ ] No logout errors

**Re-authentication Test**:
14. Try accessing `/mealsMe/` directly
    - [ ] Redirects to `/mealsMe/login`
    - [ ] User is not automatically logged back in

15. Try accessing `/mealsMe/finance`
    - [ ] Redirects to `/mealsMe/login`

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
Date tested: ___________
Tester: ___________
Cache cleared successfully: ___________
Issues found: ___________
```

---

## Test Suite 4: Offline Persistence

### Test 4.1: Offline Persistence Works (Data Available Offline)

**Objective**: Verify that Firestore offline persistence allows app to work without internet

**Priority**: High  
**Expected Result**: Previously loaded data is accessible offline

#### Steps:

**Arrange**:
1. Login to the app
2. Navigate to home page `/mealsMe/`
3. Add some progress data (water, meals)
4. Wait for data to sync to Firestore (2-3 seconds)
5. Navigate to `/mealsMe/finance` and view some data
6. Open DevTools Console
7. Verify "✅ Firestore offline persistence enabled" message

**Act**:
8. Open DevTools → Network tab
9. Enable "Offline" mode (checkbox at top)
10. Refresh the page (F5)

**Assert**:

**Offline Access Verification**:
11. After page reload (offline):
    - [ ] App loads successfully (no connection error)
    - [ ] Home page displays previously loaded data
    - [ ] Water count is visible
    - [ ] Meal data is visible

12. Navigate to `/mealsMe/finance` (offline)
    - [ ] Finance data loads from cache
    - [ ] Previously viewed data is accessible

**Console Verification**:
13. Check DevTools Console
    - [ ] No critical errors (some network errors expected)
    - [ ] Firestore reads from cache (not network)

**Offline Write Test**:
14. While still offline, try adding water:
    - [ ] UI updates optimistically
    - [ ] No error messages shown to user
    - [ ] Change is queued for sync

**Online Sync Test**:
15. Disable "Offline" mode in DevTools
16. Wait 2-3 seconds
    - [ ] Queued changes sync to Firestore
    - [ ] No data loss
    - [ ] UI remains consistent

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
Date tested: ___________
Tester: ___________
Offline functionality: ___________
Sync after reconnect: ___________
Issues found: ___________
```

---

## Test Suite 5: Error Scenarios

### Test 5.1: Permission Denied Handling

**Objective**: Verify graceful handling of Firestore permission errors

**Priority**: Medium  
**Expected Result**: User-friendly error messages, no app crashes

#### Steps:

**Arrange**:
1. Login to the app
2. Open Firebase Console → Firestore → Rules
3. Temporarily modify rules to deny all access:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
4. Publish the rules
5. Open app in new incognito window

**Act**:
6. Login to the app
7. Try to access home page
8. Try to add water or progress data

**Assert**:
9. Check for error handling:
   - [ ] User-friendly error message displayed
   - [ ] No app crash or white screen
   - [ ] Error message mentions permissions
   - [ ] Console shows permission-denied error

**Cleanup**:
10. Restore original Firestore rules
11. Verify app works again

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
Date tested: ___________
Error message shown: ___________
Issues found: ___________
```

---

### Test 5.2: Network Failure Handling

**Objective**: Verify graceful handling of network failures

**Priority**: Medium  
**Expected Result**: App continues to work with cached data

#### Steps:

**Arrange**:
1. Login to the app
2. Load some data (home page, finance page)
3. Open DevTools → Network tab

**Act**:
4. Enable "Offline" mode
5. Try to navigate between pages
6. Try to add new data

**Assert**:
7. Check app behavior:
   - [ ] Previously loaded data is still accessible
   - [ ] No critical error messages
   - [ ] App doesn't crash
   - [ ] Optimistic UI updates work

8. Re-enable network:
   - [ ] Data syncs automatically
   - [ ] No data loss

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
Date tested: ___________
Issues found: ___________
```

---

## Test Summary

### Overall Test Results

| Test Suite | Tests Passed | Tests Failed | Coverage |
|------------|--------------|--------------|----------|
| Authentication Flow | __ / 3 | __ / 3 | __% |
| Data Persistence | __ / 2 | __ / 2 | __% |
| Logout Flow | __ / 1 | __ / 1 | __% |
| Offline Persistence | __ / 1 | __ / 1 | __% |
| Error Scenarios | __ / 2 | __ / 2 | __% |
| **TOTAL** | **__ / 9** | **__ / 9** | **__%** |

### Critical Issues Found

```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

### Non-Critical Issues Found

```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

### Recommendations

```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

---

## Sign-off

**Tested By**: ___________  
**Date**: ___________  
**Overall Status**: ⬜ Passed | ⬜ Failed | ⬜ Passed with Issues  

**Approval**: ___________  
**Date**: ___________  

---

## Appendix: Quick Reference

### Firestore Paths
- User Profile: `users/{userId}/profile/data`
- Daily Progress: `users/{userId}/dailyProgress/{YYYY-MM-DD}`

### Expected Console Messages
- ✅ "Firestore offline persistence enabled"
- ✅ "Firestore cache cleared" (on logout)

### Common Issues & Solutions

**Issue**: Offline persistence not enabled  
**Solution**: Check browser compatibility (IndexedDB support required)

**Issue**: Permission denied errors  
**Solution**: Verify Firestore security rules are deployed correctly

**Issue**: Real-time sync not working  
**Solution**: Check network tab for WebSocket connection to Firestore

**Issue**: Data not persisting after logout  
**Solution**: Expected behavior - cache is cleared on logout

---

**End of Manual Testing Checklist**
