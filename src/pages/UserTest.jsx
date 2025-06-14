import { useUser } from '@clerk/clerk-react';
import { useState } from 'react';

export default function UserTest() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [syncResult, setSyncResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const manualSync = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setSyncResult(null);
    
    try {
      const userData = {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.imageUrl,
      };

      console.log('Manual sync - sending:', userData);

      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const savedUser = await response.json();
        setSyncResult({ success: true, data: savedUser });
        console.log('Manual sync successful:', savedUser);
      } else {
        const errorText = await response.text();
        setSyncResult({ success: false, error: `${response.status}: ${errorText}` });
      }
    } catch (error) {
      setSyncResult({ success: false, error: error.message });
      console.error('Manual sync error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const users = await response.json();
      console.log('All users in database:', users);
      alert(`Found ${users.length} users in database. Check console for details.`);
    } catch (error) {
      console.error('Error checking users:', error);
      alert('Error checking users: ' + error.message);
    }
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Sync Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clerk User Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Clerk User Info</h2>
            <div className="space-y-2">
              <p><strong>Is Loaded:</strong> {isLoaded ? '✅' : '❌'}</p>
              <p><strong>Is Signed In:</strong> {isSignedIn ? '✅' : '❌'}</p>
              {user ? (
                <>
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
                  <p><strong>First Name:</strong> {user.firstName}</p>
                  <p><strong>Last Name:</strong> {user.lastName}</p>
                  <p><strong>Full Name:</strong> {user.fullName}</p>
                  <p><strong>Image URL:</strong> {user.imageUrl}</p>
                </>
              ) : (
                <p className="text-red-600">No user data available</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={manualSync}
                disabled={!user || isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Syncing...' : 'Manual Sync to MongoDB'}
              </button>
              
              <button
                onClick={checkUsers}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Check All Users in DB
              </button>
            </div>
          </div>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            syncResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <h3 className="font-semibold mb-2">
              {syncResult.success ? '✅ Sync Successful' : '❌ Sync Failed'}
            </h3>
            {syncResult.success ? (
              <pre className="text-sm overflow-auto">
                {JSON.stringify(syncResult.data, null, 2)}
              </pre>
            ) : (
              <p>{syncResult.error}</p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Make sure you're signed in with Clerk</li>
            <li>Check the browser console for UserSyncProvider logs</li>
            <li>Use "Manual Sync" to test the API connection</li>
            <li>Use "Check All Users" to see what's in the database</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
