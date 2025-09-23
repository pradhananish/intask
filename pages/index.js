import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, setLogLevel } from 'firebase/firestore';

// Set Firebase log level for debugging
setLogLevel('debug');

// Global variables for Firebase configuration and app ID
// IMPORTANT: These variables are provided by the Canvas environment.
// For local development, you must replace them with your own values.

// Replace the empty object {} with your actual Firebase config object.
// You can get this from your Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// For local testing, you can use a fixed value for appId and null for the auth token.
// The app will function in anonymous mode.
const appId = "my-local-test-app";
const initialAuthToken = null;

// Firebase initialization variables
let app = null;
let db = null;
let auth = null;
let firebaseConfigError = '';

// Check if the configuration is valid before initializing Firebase
if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
    firebaseConfigError = "Firebase configuration is missing. Please ensure your environment provides a valid __firebase_config.";
    console.error(firebaseConfigError);
} else {
    // Initialize Firebase outside the component to avoid re-initialization
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
}

// Main App component
const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usernameInput, setUsernameInput] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false, show: false });
    const [usernameDisplay, setUsernameDisplay] = useState('Guest');

    // Function to display a message to the user
    const showMessage = (text, isError = false) => {
        setMessage({ text, isError, show: true });
        setTimeout(() => {
            setMessage(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // Handle initial auth state and data fetching
    useEffect(() => {
        if (firebaseConfigError) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const fetchedUsername = await fetchUserData(currentUser.uid);
                if (fetchedUsername) {
                    setUsernameDisplay(fetchedUsername);
                } else {
                    setUsernameDisplay('Guest');
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        if (initialAuthToken) {
            signInWithCustomToken(auth, initialAuthToken).catch(error => {
                console.error("Error signing in with custom token:", error);
            });
        }
        
        return () => unsubscribe();
    }, []);

    // Fetch user data from Firestore
    const fetchUserData = async (userId) => {
        if (!userId || !db) return null;
        try {
            const docRef = doc(db, `/artifacts/${appId}/users/${userId}`, 'profile');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data().username;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
        return null;
    };

    const handleLogin = async () => {
        if (firebaseConfigError || !auth || !db) {
            showMessage(firebaseConfigError || "Firebase is not initialized.", true);
            return;
        }

        const username = usernameInput.trim();
        if (username === '') {
            showMessage('Please enter a username.', true);
            return;
        }

        try {
            if (!user) {
                 await signInAnonymously(auth);
            }
            const docRef = doc(db, `/artifacts/${appId}/users/${user?.uid || auth.currentUser.uid}`, 'profile');
            await setDoc(docRef, { username });
            showMessage('Username saved successfully!', false);
        } catch (e) {
            console.error("Error writing document:", e);
            showMessage('Error saving username.', true);
        }
    };

    const handleGuestLogin = async () => {
        if (firebaseConfigError || !auth) {
            showMessage(firebaseConfigError || "Firebase is not initialized.", true);
            return;
        }

        try {
            if (!user) {
                await signInAnonymously(auth);
            }
            showMessage('Welcome, Guest!', false);
        } catch (error) {
            console.error("Error signing in anonymously:", error);
            showMessage('Error signing in as a guest.', true);
        }
    };

    const handleLogout = async () => {
        if (firebaseConfigError || !auth) {
            showMessage(firebaseConfigError || "Firebase is not initialized.", true);
            return;
        }

        try {
            await signOut(auth);
            showMessage('You have been logged out.', false);
        } catch (error) {
            console.error("Error signing out:", error);
            showMessage('Error logging out.', true);
        }
    };

    const renderView = () => {
        if (firebaseConfigError) {
            return (
                <div id="error-view" className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-red-600">Configuration Error</h1>
                    <p className="text-lg text-gray-700">The application failed to initialize due to a missing Firebase configuration.</p>
                    <p className="text-sm text-gray-500">{firebaseConfigError}</p>
                    <p className="text-sm text-gray-500">Please contact the application provider to resolve this issue.</p>
                </div>
            );
        } else if (loading) {
            return (
                <div id="loading-view" className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 animate-pulse">Loading...</h1>
                </div>
            );
        } else if (user) {
            return (
                <div id="home-view" className="space-y-6 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Welcome, <span id="user-name-display">{usernameDisplay}</span>!</h1>
                    <p className="text-lg text-gray-600">This is your personalized home page.</p>
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700">Your User ID:</p>
                        <p id="user-id-display" className="text-sm text-gray-500 break-all">{user.uid}</p>
                    </div>
                    <button
                        id="logout-btn"
                        onClick={handleLogout}
                        className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Logout
                    </button>
                </div>
            );
        } else {
            return (
                <div id="login-view" className="space-y-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">Login to your account</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button
                            id="login-btn"
                            onClick={handleLogin}
                            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Login
                        </button>
                        <button
                            id="guest-btn"
                            onClick={handleGuestLogin}
                            className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        >
                            Enter as Guest
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div
                id="message-box"
                className={`fixed top-1 left-1/2 -translate-x-1/2 z-50 p-3 rounded-lg text-white font-semibold transition-all duration-300 ${message.show ? 'top-8 opacity-100' : 'opacity-0'}`}
                style={{ backgroundColor: message.isError ? '#ef4444' : '#22c55e' }}
            >
                {message.text}
            </div>
            <div className="container">
                {renderView()}
            </div>
        </div>
    );
};

export default App;

