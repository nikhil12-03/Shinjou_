const firebaseConfig = {
    apiKey: "AIzaSyBuTDl4ATMBjWuMa2CmKm9VLW36bj0f-KE",
    authDomain: "shinjou-88e5a.firebaseapp.com",
    projectId: "shinjou-88e5a",
    storageBucket: "shinjou-88e5a.firebasestorage.app",
    messagingSenderId: "1082184450301",
    appId: "1:1082184450301:web:5fd9b903c322b115e33e94",
    measurementId: "G-LS1E858JGZ"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Firestore collections
const reviewsCollection = collection(db, "reviews");

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const googleLoginBtn = document.getElementById('googleLogin');
const facebookLoginBtn = document.getElementById('facebookLogin');
const googleSignupBtn = document.getElementById('googleSignup');
const facebookSignupBtn = document.getElementById('facebookSignup');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const userAvatar = document.getElementById('userAvatar');
const joinDate = document.getElementById('joinDate');
const reviewsTable = document.getElementById('reviewsTable');
const newReviewForm = document.getElementById('newReviewForm');


// Login with Email/Password
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm['email'].value;
        const password = loginForm['password'].value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                showError(error.message);
            });
    });
}

// Sign Up with Email/Password
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = signupForm['name'].value;
        const email = signupForm['email'].value;
        const password = signupForm['password'].value;
        const confirmPassword = signupForm['confirmPassword'].value;

        if (password !== confirmPassword) {
            showError("Passwords don't match");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Update user profile with display name
                return updateProfile(userCredential.user, {
                    displayName: name
                });
            })
            .then(() => {
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                showError(error.message);
            });
    });
}

// Google Sign In
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        signInWithPopup(auth, googleProvider)
            .then(() => {
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                showError(error.message);
            });
    });
}

// Facebook Sign In
if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener('click', () => {
        signInWithPopup(auth, facebookProvider)
            .then(() => {
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                showError(error.message);
            });
    });
}

// Google Sign Up
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', () => {
        signInWithPopup(auth, googleProvider)
            .then(() => {
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                showError(error.message);
            });
    });
}

// Facebook Sign Up
if (facebookSignupBtn) {
    facebookSignupBtn.addEventListener('click', () => {
        signInWithPopup(auth, facebookProvider)
            .then(() => {
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                showError(error.message);
            });
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                showError(error.message);
            });
    });
}

// Update User Profile in UI
async function updateUserProfile(user) {
    if (userName) userName.textContent = user.displayName || user.email;
    if (profileName) profileName.textContent = user.displayName || 'User';
    if (profileEmail) profileEmail.textContent = user.email;

    // Set avatar
    if (userAvatar) {
        const photoURL = user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`;
        userAvatar.src = photoURL;
    }

    // Set join date
    if (joinDate) {
        const date = new Date(user.metadata.creationTime);
        joinDate.textContent = date.toLocaleDateString();
    }

    // Load user's reviews
    if (reviewsTable) {
        loadUserReviews(user.uid);
    }
}

// Load user's reviews from Firestore
async function loadUserReviews(userId) {
    const q = query(reviewsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    reviewsTable.innerHTML = ''; // Clear existing rows

    querySnapshot.forEach((doc) => {
        const review = doc.data();
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${review.companyName}</td>
            <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
            <td>${new Date(review.timestamp).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary">Edit</button>
                <button class="btn btn-sm btn-outline-danger">Delete</button>
            </td>
        `;
        reviewsTable.appendChild(newRow);
    });

    // Update review count
    if (document.getElementById('reviewCount')) {
        document.getElementById('reviewCount').textContent = querySnapshot.size;
    }
}

// Show error message
function showError(message) {
    // Create or find error element
    let errorElement = document.getElementById('authError');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'authError';
        errorElement.className = 'alert alert-danger mt-3 animate__animated animate__headShake';
        const form = document.querySelector('form');
        if (form) form.appendChild(errorElement);
    }

    errorElement.textContent = message;
    setTimeout(() => {
        errorElement.classList.remove('animate__headShake');
    }, 1000);
}

// Star Rating
if (document.querySelector('.star-rating')) {
    const stars = document.querySelectorAll('.star-rating i');
    const ratingValue = document.getElementById('ratingValue');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            ratingValue.value = rating;

            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
    });
}

// Submit New Review
if (newReviewForm) {
    newReviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const companyName = newReviewForm['companyName'].value;
        const rating = parseInt(newReviewForm['ratingValue'].value);
        const reviewText = newReviewForm['reviewText'].value;

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            // Save to Firestore
            await addDoc(reviewsCollection, {
                userId: user.uid,
                companyName,
                rating,
                reviewText,
                timestamp: new Date(),
                userName: user.displayName || 'Anonymous'
            });

            // Reset form
            newReviewForm.reset();
            document.querySelectorAll('.star-rating i').forEach(star => {
                star.classList.remove('fas');
                star.classList.add('far');
            });
            ratingValue.value = '0';

            // Show success message
            const alert = document.createElement('div');
            alert.className = 'alert alert-success mt-3 animate__animated animate__fadeIn';
            alert.textContent = 'Review submitted successfully!';
            newReviewForm.appendChild(alert);
            setTimeout(() => {
                alert.remove();
            }, 3000);

            // Refresh reviews
            loadUserReviews(user.uid);

        } catch (error) {
            console.error('Error saving review:', error);
            showError('Failed to save review: ' + error.message);
        }
    });
}
