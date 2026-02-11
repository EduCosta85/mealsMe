/**
 * User Profile Service
 * 
 * Manages user profile data in Firestore.
 * Handles profile creation on first login and lastLogin updates on subsequent logins.
 * 
 * Data structure: /users/{userId}/profile/
 *   - userId: string
 *   - email: string
 *   - displayName: string
 *   - photoURL: string
 *   - createdAt: Timestamp
 *   - lastLogin: Timestamp
 */

import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * User profile data structure stored in Firestore
 */
export interface UserProfile {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly photoURL: string;
  readonly createdAt: ReturnType<typeof serverTimestamp>;
  readonly lastLogin: ReturnType<typeof serverTimestamp>;
}

/**
 * Result type for service operations
 */
interface ServiceResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

/**
 * Creates a user profile in Firestore on first login
 * 
 * Stores user email, displayName, photoURL, createdAt, and lastLogin timestamps.
 * Uses setDoc with merge to avoid overwriting existing profiles.
 * 
 * @param db - Firestore database instance
 * @param user - Firebase authenticated user
 * @returns Promise with operation result
 * 
 * @example
 * ```typescript
 * const result = await createUserProfile(db, user);
 * if (result.success) {
 *   console.log('Profile created:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */
export async function createUserProfile(
  db: Firestore,
  user: User,
): Promise<ServiceResult<UserProfile>> {
  try {
    // Validate input
    if (!user?.uid) {
      return {
        success: false,
        error: 'Invalid user: missing uid',
      };
    }

    // Build profile data
    const profileData: UserProfile = {
      userId: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };

    // Create document reference: users/{userId}/profile
    const profileRef = doc(db, 'users', user.uid, 'profile', 'data');

    // Create profile (merge: true prevents overwriting existing data)
    await setDoc(profileRef, profileData, { merge: true });

    return {
      success: true,
      data: profileData,
    };
  } catch (error) {
    console.error('Create user profile error:', error);
    return {
      success: false,
      error: 'Failed to create user profile',
    };
  }
}

/**
 * Updates the lastLogin timestamp for an existing user profile
 * 
 * Called on subsequent logins to track user activity.
 * Only updates the lastLogin field, preserving all other profile data.
 * 
 * @param db - Firestore database instance
 * @param userId - User ID (uid from Firebase Auth)
 * @returns Promise with operation result
 * 
 * @example
 * ```typescript
 * const result = await updateLastLogin(db, user.uid);
 * if (!result.success) {
 *   console.error('Failed to update lastLogin:', result.error);
 * }
 * ```
 */
export async function updateLastLogin(
  db: Firestore,
  userId: string,
): Promise<ServiceResult<void>> {
  try {
    // Validate input
    if (!userId) {
      return {
        success: false,
        error: 'Invalid userId: cannot be empty',
      };
    }

    // Create document reference: users/{userId}/profile
    const profileRef = doc(db, 'users', userId, 'profile', 'data');

    // Update only lastLogin field
    await updateDoc(profileRef, {
      lastLogin: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update lastLogin error:', error);
    return {
      success: false,
      error: 'Failed to update lastLogin timestamp',
    };
  }
}
