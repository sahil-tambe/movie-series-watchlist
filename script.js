const moviesData = [
    { id: 1, title: 'All of Us Dead', type: 'Series', category: 'Horror', description: 'A zombie virus breaks out in South Korea as high school students struggle to survive.' },
    { id: 2, title: 'Squid Game', type: 'Series', category: 'Drama', description: 'Desperate adults take part in deadly children\'s games for a huge cash prize.' },
    { id: 3, title: 'Twilight', type: 'Movie', category: 'Romance', description: 'A teenage girl falls in love with a mysterious vampire in a small town.' },
    { id: 4, title: 'The Notebook', type: 'Movie', category: 'Romance', description: 'A timeless love story that spans decades and heartbreak.' },
    { id: 5, title: 'Parasite', type: 'Movie', category: 'Drama', description: 'A poor family manipulates their way into a wealthy household and a twisted power struggle.' },
    { id: 6, title: 'The Ring', type: 'Movie', category: 'Horror', description: 'A journalist investigates a cursed VHS tape linked to a string of mysterious deaths.' },
    { id: 7, title: 'Stranger Things', type: 'Series', category: 'Sci-Fi', description: 'Children in a small town confront supernatural forces and government secrets.' },
    { id: 8, title: 'The Crown', type: 'Series', category: 'Drama', description: 'A dramatic look at the British royal family and the weight of the crown.' },
    { id: 9, title: 'A Quiet Place', type: 'Movie', category: 'Horror', description: 'A family tries to survive in silence while monsters hunt by sound.' },
    { id: 10, title: 'Interstellar', type: 'Movie', category: 'Sci-Fi', description: 'A team of astronauts travels through a wormhole to save humanity.' },
    { id: 11, title: '500 Days of Summer', type: 'Movie', category: 'Romance', description: 'A man chronicles the highs and lows of a relationship with the wrong woman.' },
    { id: 12, title: 'Breaking Bad', type: 'Series', category: 'Drama', description: 'A chemistry teacher turns to a criminal life after getting involved in meth production.' }
];

const demoUsers = [
    { email: 'test@example.com', password: 'password123' },
    { email: 'user@example.com', password: 'user123' }
];

let currentUser = null;
let watchlist = [];

window.addEventListener('DOMContentLoaded', () => {
    checkIfLoggedIn();
});

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorEl = document.getElementById('loginError');

    const user = demoUsers.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('watchlistUser', JSON.stringify(user));
        watchlist = JSON.parse(localStorage.getItem(`watchlist_${email}`)) || [];

        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('mainPage').classList.add('active');

        renderAll();
        errorEl.textContent = '';
    } else {
        errorEl.textContent = 'Invalid email or password!';
    }
}

function handleLogout() {
    if (currentUser) {
        localStorage.setItem(`watchlist_${currentUser.email}`, JSON.stringify(watchlist));
    }

    currentUser = null;
    watchlist = [];
    localStorage.removeItem('watchlistUser');

    document.getElementById('loginPage').classList.add('active');
    document.getElementById('mainPage').classList.remove('active');

    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function checkIfLoggedIn() {
    const savedUser = localStorage.getItem('watchlistUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        watchlist = JSON.parse(localStorage.getItem(`watchlist_${currentUser.email}`)) || [];

        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('mainPage').classList.add('active');

        renderAll();
    }
}

function renderAll() {
    renderMovies();
    renderWatchlist();
}

function renderMovies() {
    const grid = document.getElementById('moviesGrid');
    const filtered = getFilteredMovies();

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-message">No movies/series found</div>';
        return;
    }

    grid.innerHTML = filtered.map(movie => createMovieCard(movie)).join('');
}

function renderWatchlist() {
    const grid = document.getElementById('watchlistGrid');

    if (watchlist.length === 0) {
        grid.innerHTML = '<div class="empty-message">Your watchlist is empty. Add some movies/series!</div>';
        return;
    }

    grid.innerHTML = watchlist.map(item => {
        const movie = moviesData.find(m => m.id === item.movieId);
        return createWatchlistCard(movie, item);
    }).join('');
}

function createMovieCard(movie) {
    const inWatchlist = watchlist.some(w => w.movieId === movie.id);

    return `
        <div class="card">
            <div class="card-header">
                <div>
                    <h3>${movie.title}</h3>
                    <span class="card-category">${movie.category}</span>
                </div>
            </div>
            <span class="card-type">📺 ${movie.type}</span>
            <p class="card-description">${movie.description}</p>
            <div class="card-buttons">
                <button class="btn-view" onclick="viewDetails(${movie.id})">View Details</button>
                ${inWatchlist ?
                    `<button class="btn-remove" onclick="removeFromWatchlist(${movie.id})">Remove</button>` :
                    `<button class="btn-add" onclick="addToWatchlist(${movie.id})">Add to Watchlist</button>`}
            </div>
        </div>
    `;
}

function createWatchlistCard(movie, item) {
    const statusClass = item.watched ? 'status-watched' : 'status-to-watch';
    const statusText = item.watched ? '✅ Already Watched' : '⏳ To Watch';

    return `
        <div class="card">
            <div class="card-header">
                <div>
                    <h3>${movie.title}</h3>
                    <span class="card-category">${movie.category}</span>
                </div>
            </div>
            <span class="card-type">📺 ${movie.type}</span>
            <p class="card-description">${movie.description}</p>
            <div class="status-badge ${statusClass}">${statusText}</div>
            <div class="card-buttons">
                <button class="btn-view" onclick="viewDetails(${movie.id})">View Details</button>
                <button class="btn-remove" onclick="removeFromWatchlist(${movie.id})">Remove</button>
            </div>
            ${!item.watched ?
                `<button class="btn-add" style="margin-top: 10px; width: 100%;" onclick="markAsWatched(${movie.id})">Mark as Watched</button>` :
                `<button class="btn-add" style="margin-top: 10px; width: 100%; background: #ff9800;" onclick="markAsToWatch(${movie.id})">Mark as To Watch</button>`}
        </div>
    `;
}

function addToWatchlist(movieId) {
    const movie = moviesData.find(m => m.id === movieId);

    if (!watchlist.some(w => w.movieId === movieId)) {
        watchlist.push({ movieId, watched: false, addedDate: new Date().toLocaleDateString() });
        saveWatchlist();
        renderAll();
        alert(`✅ "${movie.title}" added to your watchlist!`);
    }
}

function removeFromWatchlist(movieId) {
    const movie = moviesData.find(m => m.id === movieId);
    watchlist = watchlist.filter(w => w.movieId !== movieId);
    saveWatchlist();
    renderAll();
    alert(`❌ "${movie.title}" removed from your watchlist!`);
}

function markAsWatched(movieId) {
    const item = watchlist.find(w => w.movieId === movieId);
    if (item) {
        item.watched = true;
        saveWatchlist();
        renderWatchlist();
        alert('✅ Marked as watched!');
    }
}

function markAsToWatch(movieId) {
    const item = watchlist.find(w => w.movieId === movieId);
    if (item) {
        item.watched = false;
        saveWatchlist();
        renderWatchlist();
        alert('⏳ Marked as to watch!');
    }
}

function saveWatchlist() {
    if (currentUser) {
        localStorage.setItem(`watchlist_${currentUser.email}`, JSON.stringify(watchlist));
    }
}

function getFilteredMovies() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;

    return moviesData.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchQuery) || movie.description.toLowerCase().includes(searchQuery);
        const matchesCategory = !selectedCategory || movie.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
}

function filterMovies() {
    renderMovies();
}

function viewDetails(movieId) {
    const movie = moviesData.find(m => m.id === movieId);
    const watchlistItem = watchlist.find(w => w.movieId === movieId);
    const statusText = watchlistItem ?
        (watchlistItem.watched ? '✅ You have already watched this!' : '⏳ In your to-watch list') :
        '➕ Not in your watchlist';

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 class="modal-title">${movie.title}</h2>
        <div class="modal-info">
            <p><strong>Type:</strong> ${movie.type}</p>
            <p><strong>Category:</strong> <span style="background: #ffd700; color: #1a1a2e; padding: 4px 10px; border-radius: 20px;">${movie.category}</span></p>
            <p><strong>Description:</strong></p>
            <p>${movie.description}</p>
            <p style="margin-top: 20px; padding: 15px; background: rgba(255,215,0,.1); border-left: 3px solid #ffd700; border-radius: 5px;"> <strong>${statusText}</strong> </p>
        </div>
        <div class="modal-buttons">
            ${watchlistItem ?
                `<button class="btn-remove" onclick="removeFromWatchlist(${movie.id}); closeModal();">Remove from Watchlist</button>` :
                `<button class="btn-add" onclick="addToWatchlist(${movie.id}); closeModal();">Add to Watchlist</button>`}
            <button class="btn-view" onclick="closeModal()">Close</button>
        </div>
    `;

    document.getElementById('detailsModal').classList.add('active');
}

function closeModal() {
    document.getElementById('detailsModal').classList.remove('active');
}

window.onclick = function (event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        modal.classList.remove('active');
    }
};
