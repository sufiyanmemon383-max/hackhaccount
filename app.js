// Global state for simplicity (Real app would use a server/database)
let currentUser = null; 
let posts = []; // Array to store post objects

// --- DOM Elements ---
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('show-signup');
const hideSignupBtn = document.getElementById('hide-signup');
const welcomeUserSpan = document.getElementById('welcome-user');
const logoutBtn = document.getElementById('logout-btn');
const postTextarea = document.getElementById('post-text');
const imageUrlInput = document.getElementById('image-url');
const publishBtn = document.getElementById('publish-btn');
const postsFeed = document.getElementById('posts-feed');
const searchInput = document.getElementById('search-input');


// --- Utility Functions ---

/**
 * Renders a single post object into an HTML element.
 * @param {object} post - The post data.
 */
function createPostElement(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    postCard.dataset.id = post.id; // Store unique ID

    const postDate = new Date(post.timestamp).toLocaleString();
    
    // Generate HTML for the comments list
    const commentsHtml = post.comments.map(comment => `
        <div class="comment-item">
            <strong>${comment.author}:</strong> ${comment.text}
        </div>
    `).join('');

    // The inner HTML for the post, displaying all required elements [cite: 34, 35, 36, 37, 38]
    postCard.innerHTML = `
        <div class="post-meta">
            <span>Posted by: **${post.author}**</span>
            <span>${postDate}</span>
        </div>
        <p class="post-content">${post.text}</p>
        ${post.imageUrl ? `<div class="post-image"><img src="${post.imageUrl}" alt="Post Image"></div>` : ''}
        
        <div class="post-actions">
            <button class="like-button ${post.isLiked ? 'liked' : ''}">
                <span class="heart-icon">${post.isLiked ? '❤️' : '🤍'}</span> 
                <span class="like-count">${post.likes}</span> Likes 
            </button>
            <button class="comment-toggle-button">💬 Comment (${post.comments.length})</button>
            <button class="share-button">Share 🔗</button>
            <button class="delete-button">Delete Post</button>
        </div>

        <div class="comments-section hidden">
            <div class="comments-list">${commentsHtml}</div>
            <form class="add-comment-form">
                <input type="text" placeholder="Write a comment..." required>
                <button type="submit">Add</button>
            </form>
        </div>
    `;
    
    // Add event listeners for the Like, Delete, Share, and Comment buttons
    postCard.querySelector('.like-button').addEventListener('click', toggleLike);
    postCard.querySelector('.delete-button').addEventListener('click', deletePost);
    postCard.querySelector('.share-button').addEventListener('click', sharePost);
    postCard.querySelector('.comment-toggle-button').addEventListener('click', toggleComments);
    postCard.querySelector('.add-comment-form').addEventListener('submit', addComment);

    return postCard;
}


/**
 * Renders the entire posts array to the feed.
 */
function renderPosts(filteredPosts = posts) {
    postsFeed.innerHTML = ''; // Clear existing posts
    
    // Display new post on top (latest-first) [cite: 31]
    filteredPosts.slice().reverse().forEach(post => { 
        postsFeed.appendChild(createPostElement(post));
    });
}


// --- Event Handlers ---

/**
 * Handles the Sign Up form submission (UI only). [cite: 18]
 */
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    // In a real app, you would store credentials securely. Here, we just log and switch back.
    console.log(`User ${name} signed up! (UI only)`); 
    
    // Auto-fill login form for easy demo
    document.getElementById('login-email').value = document.getElementById('signup-email').value;
    document.getElementById('login-password').value = document.getElementById('signup-password').value;
    
    // Simple redirect/switch to login form
    alert(`Account for ${name} created (UI only). Please log in.`);
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});


/**
 * Handles the Login form submission (UI only). [cite: 19]
 */
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const name = email.split('@')[0]; // Simple name extraction for "Welcome, User" [cite: 21]

    // Simple success logic - any non-empty fields work for this front-end only challenge.
    if (email && document.getElementById('login-password').value) {
        currentUser = { name: name, email: email };
        
        // Redirect to Social Feed page [cite: 20]
        authScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        welcomeUserSpan.textContent = `Welcome, ${currentUser.name}!`;
        renderPosts();
    } else {
        alert('Please enter email and password.');
    }
});


/**
 * Handles the Logout button.
 */
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    authScreen.classList.remove('hidden');
    mainApp.classList.add('hidden');
    // Clear forms (optional)
    loginForm.reset(); 
    signupForm.reset();
});


/**
 * Toggles visibility between Login and Signup forms.
 */
showSignupBtn.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
});

hideSignupBtn.addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});


/**
 * Handles the Publish Post button click. [cite: 30]
 */
publishBtn.addEventListener('click', () => {
    const postText = postTextarea.value.trim();
    const imageUrl = imageUrlInput.value.trim();

    if (postText === '') {
        alert('Post content cannot be empty!');
        return;
    }

    const newPost = {
        id: Date.now(), // Unique ID for the post
        author: currentUser.name,
        text: postText,
        imageUrl: imageUrl, // Optional image URL [cite: 28]
        timestamp: new Date().toISOString(),
        likes: 0, 
        isLiked: false,
        comments: [] // Initialize new post with empty comments array
    };

    posts.push(newPost);
    postTextarea.value = ''; // Clear text area
    imageUrlInput.value = ''; // Clear image URL input
    
    renderPosts(); // Re-render the feed to show the new post
});


/**
 * Toggles the Like state of a post. [cite: 40, 41]
 * @param {Event} e - The click event.
 */
function toggleLike(e) {
    // Find the closest parent post-card element to get the post ID
    const postCard = e.currentTarget.closest('.post-card');
    const postId = parseInt(postCard.dataset.id);
    const post = posts.find(p => p.id === postId);

    if (post) {
        if (post.isLiked) {
            post.likes -= 1;
            post.isLiked = false;
        } else {
            post.likes += 1;
            post.isLiked = true;
        }
        
        // Update the display immediately
        e.currentTarget.classList.toggle('liked', post.isLiked);
        e.currentTarget.querySelector('.heart-icon').textContent = post.isLiked ? '❤️' : '🤍';
        e.currentTarget.querySelector('.like-count').textContent = post.likes;
    }
}


/**
 * Deletes a post from the feed. [cite: 43]
 * @param {Event} e - The click event.
 */
function deletePost(e) {
    const confirmDelete = confirm('Are you sure you want to delete this post?'); // Optional confirmation [cite: 44]
    
    if (confirmDelete) {
        const postCard = e.currentTarget.closest('.post-card');
        const postId = parseInt(postCard.dataset.id);

        // Remove post from the global array
        posts = posts.filter(p => p.id !== postId);
        
        // Remove post from the DOM [cite: 43]
        postCard.remove(); 
    }
}


/**
 * Filters posts based on the search input text content. [cite: 47]
 */
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    
    const filtered = posts.filter(post => 
        post.text.toLowerCase().includes(searchTerm)
    );

    renderPosts(filtered);
});


/**
 * Opens the browser's native share dialog for the post text.
 * @param {Event} e - The click event.
 */
function sharePost(e) {
    const postCard = e.currentTarget.closest('.post-card');
    const postText = postCard.querySelector('.post-content').textContent;

    if (navigator.share) {
        navigator.share({
            title: 'Check out this post!',
            text: `"${postText}" - Shared from Mini Social App`,
            url: window.location.href // Shares the current page link
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
        // Fallback for browsers that don't support Web Share API
        alert(`Sharing not supported in this browser. Post content: "${postText}"`);
    }
}

/**
 * Toggles the visibility of the comments section.
 * @param {Event} e - The click event.
 */
function toggleComments(e) {
    const postCard = e.currentTarget.closest('.post-card');
    const commentsSection = postCard.querySelector('.comments-section');
    commentsSection.classList.toggle('hidden');
}


/**
 * Adds a new comment to a post.
 * @param {Event} e - The submit event from the comment form.
 */
function addComment(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const commentInput = form.querySelector('input[type="text"]');
    const commentText = commentInput.value.trim();

    if (commentText === '' || !currentUser) return;

    const postCard = form.closest('.post-card');
    const postId = parseInt(postCard.dataset.id);
    const post = posts.find(p => p.id === postId);

    if (post) {
        const newComment = {
            author: currentUser.name,
            text: commentText,
            timestamp: Date.now()
        };

        post.comments.push(newComment); // Add to the global state

        // Re-render the post to update the comments list and counter
        renderPosts();
        
        // Optional: If you want to keep the comments open after adding one, you'd need more complex logic.
        // For simplicity, we just clear the input and re-render.
    }
}


// --- Initialization ---

// Add some dummy posts to start the feed
function initializeDummyPosts() {
    posts.push({ 
        id: 1678886400000, 
        author: "Demo User", 
        text: "Welcome to the Mini Social App! This is my first post.", 
        imageUrl: '', 
        timestamp: '2023-01-01T10:00:00Z', 
        likes: 2, 
        isLiked: false, 
        comments: [
            { author: "Ali", text: "Nice work on the app!", timestamp: 1678886400001 }
        ] // Added comments array
    });
    posts.push({ 
        id: 1678972800000, 
        author: "Ali", 
        text: "Having fun with the Coding Night Challenge! HTML, CSS, and JS only!", 
        imageUrl: 'https://picsum.photos/400/200', 
        timestamp: '2023-01-02T12:30:00Z', 
        likes: 5, 
        isLiked: true,
        comments: [] // Added comments array
    });
}

initializeDummyPosts();

// By default, the app starts on the auth screen.
document.addEventListener('DOMContentLoaded', () => {
    // Check if a user is logged in (optional localStorage logic could go here)
    if (currentUser) {
        authScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        welcomeUserSpan.textContent = `Welcome, ${currentUser.name}!`;
        renderPosts();
    } else {
        authScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
});









