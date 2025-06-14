import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

export function UserSyncProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    console.log('🔄 UserSyncProvider - State changed:', {
      isLoaded,
      isSignedIn,
      hasUser: !!user,
      userId: user?.id
    });

    const saveUserToMongoDB = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          console.log('💾 Attempting to save user to MongoDB...');
          console.log('👤 User data from Clerk:', {
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            imageUrl: user.imageUrl
          });

          const userData = {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.imageUrl,
          };

          console.log('📤 Sending to API:', userData);

          // Direct API call to save user
          const response = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          console.log('📡 API Response status:', response.status);

          if (response.ok) {
            const savedUser = await response.json();
            console.log('✅ User saved to MongoDB successfully!');
            console.log('💾 Saved user data:', savedUser);
          } else {
            const errorText = await response.text();
            console.error('❌ Failed to save user:', response.status, response.statusText);
            console.error('❌ Error details:', errorText);
          }
        } catch (error) {
          console.error('❌ Error saving user to MongoDB:', error);
          console.error('❌ Error stack:', error.stack);
        }
      } else {
        console.log('⏳ Not ready to sync user:', {
          isLoaded,
          isSignedIn,
          hasUser: !!user
        });
      }
    };

    saveUserToMongoDB();
  }, [user, isLoaded, isSignedIn]);

  return children;
}
