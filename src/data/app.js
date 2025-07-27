import categories from './categories.js';
import TMDBService from './tmdb-service.js';
import DatabaseService from './database-service.js';

// App version for cache busting
const APP_VERSION = '3.0';
console.log(`Date Night App v${APP_VERSION} loaded`);

class DateNightApp {
    constructor() {
        this.version = APP_VERSION;
        this.currentScreen = 'welcome';
        this.tmdb = new TMDBService();
        this.db = new DatabaseService(); // Add database service
        this.currentSort = 'popularity.desc'; // Default sorting
        this.selections = {
            platforms: [],
            genres: [],
            films: [],
            dishes: [],
            snacks: [],
            drinks: [] // No pre-selected drinks
        };
        
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            platform: document.getElementById('platform-screen'),
            genre: document.getElementById('genre-screen'),
            film: document.getElementById('film-screen'),
            dish: document.getElementById('dish-screen'),
            snacks: document.getElementById('snacks-screen'),
            drinks: document.getElementById('drinks-screen'),
            final: document.getElementById('final-screen')
        };
        
        this.elements = {
            appTitle: document.getElementById('app-title'),
            backBtn: document.getElementById('back-btn'),
            startBtn: document.getElementById('start-btn'),
            
            platformGrid: document.getElementById('platform-grid'),
            platformNextBtn: document.getElementById('platform-next-btn'),
            
            genreGrid: document.getElementById('genre-grid'),
            genreNextBtn: document.getElementById('genre-next-btn'),
            
            filmGrid: document.getElementById('film-grid'),
            filmNextBtn: document.getElementById('film-next-btn'),
            
            dishGrid: document.getElementById('dish-grid'),
            dishNextBtn: document.getElementById('dish-next-btn'),
            
            snacksGrid: document.getElementById('snacks-grid'),
            snacksNextBtn: document.getElementById('snacks-next-btn'),
            
            drinksGrid: document.getElementById('drinks-grid'),
            drinksFinishBtn: document.getElementById('drinks-finish-btn'),
            
            finalSummary: document.getElementById('final-summary'),
            startOverBtn: document.getElementById('start-over-btn'),
            
            actionButtons: document.querySelector('.action-buttons')
        };
        
        this.init();
    }

    async init() {
        console.log('Initializing Date Night App...');
        
        // Initialize database session
        try {
            await this.db.initializeSession();
            console.log('✅ Database session initialized');
        } catch (error) {
            console.warn('⚠️ Database initialization failed, continuing without DB:', error);
        }
        
        this.setupEventListeners();
        this.renderGrids();
        this.showScreen('welcome');
        
        // Set initial button states
        this.elements.platformNextBtn.disabled = true;
        this.elements.genreNextBtn.disabled = true;
        this.elements.filmNextBtn.disabled = true;
        this.elements.dishNextBtn.disabled = true;
        this.elements.snacksNextBtn.disabled = true;
        this.elements.drinksFinishBtn.disabled = true; // No drinks pre-selected
        
        console.log('Date Night App initialized successfully!');
    }

    setupEventListeners() {
        // Start button
        this.elements.startBtn.addEventListener('click', () => {
            this.showScreen('platform');
        });

        // Back button
        this.elements.backBtn.addEventListener('click', () => {
            this.goBack();
        });

        // Platform buttons
        this.elements.platformNextBtn.addEventListener('click', () => {
            this.showScreen('genre');
        });

        // Genre buttons
        this.elements.genreNextBtn.addEventListener('click', async () => {
            await this.loadMoviesAndShowFilmScreen();
        });

        // Film buttons
        this.elements.filmNextBtn.addEventListener('click', () => {
            this.showScreen('dish');
        });

        // Dish buttons
        this.elements.dishNextBtn.addEventListener('click', () => {
            this.showScreen('snacks');
        });

        // Snacks buttons
        this.elements.snacksNextBtn.addEventListener('click', () => {
            this.showScreen('drinks');
        });

        // Drinks buttons
        this.elements.drinksFinishBtn.addEventListener('click', () => {
            console.log('Drinks finish button clicked!');
            this.finishSelection();
        });

        // Final screen buttons
        if (this.elements.startOverBtn) {
            this.elements.startOverBtn.addEventListener('click', () => {
                this.resetApp();
            });
        }
    }

    showScreen(screenName) {
        console.log('showScreen called with:', screenName);
        
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            console.log('Screen activated:', screenName);
        } else {
            console.error('Screen not found:', screenName);
        }

        // Update navigation
        this.updateNavigation(screenName);
        this.updateActionButtons(screenName);
        this.currentScreen = screenName;
    }

    updateActionButtons(screenName) {
        // Hide action buttons container first
        const actionButtonsContainer = document.querySelector('.action-buttons');
        
        // Hide all individual buttons
        const allButtons = [
            'platform-next-btn',
            'genre-next-btn', 
            'film-next-btn',
            'dish-next-btn',
            'snacks-next-btn',
            'drinks-finish-btn'
        ];
        
        allButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = 'none';
        });

        // Show container and appropriate button based on screen
        if (screenName === 'platform') {
            actionButtonsContainer.style.display = 'flex';
            document.getElementById('platform-next-btn').style.display = 'block';
        } else if (screenName === 'genre') {
            actionButtonsContainer.style.display = 'flex';
            document.getElementById('genre-next-btn').style.display = 'block';
        } else if (screenName === 'film') {
            actionButtonsContainer.style.display = 'flex';
            document.getElementById('film-next-btn').style.display = 'block';
        } else if (screenName === 'dish') {
            actionButtonsContainer.style.display = 'flex';
            document.getElementById('dish-next-btn').style.display = 'block';
        } else if (screenName === 'snacks') {
            actionButtonsContainer.style.display = 'flex';
            document.getElementById('snacks-next-btn').style.display = 'block';
        } else if (screenName === 'drinks') {
            actionButtonsContainer.style.display = 'flex';
            document.getElementById('drinks-finish-btn').style.display = 'block';
        } else {
            // For welcome and final screens, hide action buttons
            actionButtonsContainer.style.display = 'none';
        }
    }

    updateNavigation(screenName) {
        const titles = {
            welcome: 'Date Night',
            platform: '📺 Platformy',
            genre: '🎭 Žánre',
            film: '🎬 Filmy',
            dish: '🍽️ Hlavné jedlo',
            snacks: '🍿 Občerstvenie',
            drinks: '🥂 Nápoje',
            final: '💕 Hotovo!'
        };

        this.elements.appTitle.textContent = "Date Night";
        this.elements.appTitle.classList.add('primary-color');
        
        // Show/hide back button
        if (screenName === 'welcome' || screenName === 'final') {
            this.elements.backBtn.style.display = 'none';
        } else {
            this.elements.backBtn.style.display = 'flex';
        }
    }

    goBack() {
        const navigation = {
            platform: 'welcome',
            genre: 'platform',
            film: 'genre',
            dish: 'film',
            snacks: 'dish',
            drinks: 'snacks'
        };

        const previousScreen = navigation[this.currentScreen];
        if (previousScreen) {
            this.showScreen(previousScreen);
        }
    }

    renderGrids() {
        this.renderPlatformGrid();
        this.renderGenreGrid();
        this.renderFilmGrid();
        this.renderDishGrid();
        this.renderSnacksGrid();
        this.renderDrinksGrid();
    }

    async renderPlatformGrid() {
        this.elements.platformGrid.innerHTML = '';
        const platforms = this.tmdb.getPlatforms();
        
        platforms.forEach(platform => {
            const element = this.createPlatformItem(platform);
            this.elements.platformGrid.appendChild(element);
        });
    }

    async renderGenreGrid() {
        this.elements.genreGrid.innerHTML = '';
        
        // Add "All genres" option first
        const allGenresElement = this.createGenreItem({ id: 'all', name: 'Všetky žánre' });
        this.elements.genreGrid.appendChild(allGenresElement);
        
        const genres = await this.tmdb.getGenres();
        
        genres.forEach(genre => {
            const element = this.createGenreItem(genre);
            this.elements.genreGrid.appendChild(element);
        });
    }

    createPlatformItem(platform) {
        const element = document.createElement('div');
        element.className = `selection-item platform-item ${platform.id}`;
        element.innerHTML = `
            <div class="platform-logo">${platform.logo}</div>
            <div>${platform.name}</div>
        `;
        
        element.addEventListener('click', () => {
            this.toggleSelection(platform.id, 'platforms', element);
        });
        
        return element;
    }

    createGenreItem(genre) {
        const element = document.createElement('div');
        element.className = 'selection-item genre-item';
        element.textContent = genre.name;
        
        element.addEventListener('click', () => {
            this.toggleSelection(genre.id, 'genres', element);
        });
        
        return element;
    }

    async loadMoviesAndShowFilmScreen() {
        try {
            this.showScreen('film');
            
            // Show loading
            this.elements.filmGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">Načítavam filmy...</p>';
            
            // If "All genres" is selected, pass empty array to get all genres
            const genresToSearch = this.selections.genres.includes('all') ? [] : this.selections.genres;
            
            const result = await this.tmdb.discoverMovies(
                this.selections.platforms,
                genresToSearch,
                100,
                this.currentSort
            );

            // Convert TMDB movies to our format
            this.movieData = result.movies.map(movie => this.tmdb.formatMovie(movie));
            
            // Render movies
            this.renderMovieGrid();
            
            // Add sort selector
            this.addSortSelector();
            
        } catch (error) {
            console.error('Error loading movies:', error);
            this.elements.filmGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Chyba pri načítavaní filmov.</p>';
        }
    }

    renderMovieGrid() {
        this.elements.filmGrid.innerHTML = '';
        
        if (!this.movieData || this.movieData.length === 0) {
            this.elements.filmGrid.innerHTML = '<p>Nenašli sa žiadne filmy pre vybrané kritériá.</p>';
            return;
        }

        this.movieData.slice(0, 80).forEach(movie => { // Show first 80 movies
            const element = this.createMovieItem(movie);
            this.elements.filmGrid.appendChild(element);
        });
    }

    createMovieItem(movie) {
        const element = document.createElement('div');
        element.className = 'selection-item movie-item';
        
        const rating = movie.voteAverage ? `⭐ ${movie.voteAverage.toFixed(1)}` : '';
        
        element.innerHTML = `
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                ${rating ? `<div class="movie-rating">${rating}</div>` : ''}
            </div>
        `;
        
        if (movie.posterPath) {
            element.style.backgroundImage = `url(${movie.posterPath})`;
            element.classList.add('has-poster');
        }
        
        element.addEventListener('click', () => {
            this.toggleSelection(movie.title, 'films', element);
        });
        
        return element;
    }

    renderFilmGrid() {
        this.elements.filmGrid.innerHTML = '';
        categories.films.items.forEach(item => {
            const element = this.createSelectionItem(item, 'films');
            this.elements.filmGrid.appendChild(element);
        });
    }

    renderDishGrid() {
        this.elements.dishGrid.innerHTML = '';
        categories.dishes.items.forEach(item => {
            const element = this.createSelectionItem(item, 'dishes');
            this.elements.dishGrid.appendChild(element);
        });
    }

    renderSnacksGrid() {
        this.elements.snacksGrid.innerHTML = '';
        categories.snacks.items.forEach(item => {
            const element = this.createSelectionItem(item, 'snacks');
            this.elements.snacksGrid.appendChild(element);
        });
    }

    renderDrinksGrid() {
        this.elements.drinksGrid.innerHTML = '';
        categories.drinks.items.forEach(item => {
            const itemName = typeof item === 'object' ? item.name : item;
            const isLocked = typeof item === 'object' && item.locked;
            const element = this.createSelectionItem(itemName, 'drinks', isLocked);
            this.elements.drinksGrid.appendChild(element);
        });
    }

    createSelectionItem(item, category, isLocked = false) {
        const element = document.createElement('div');
        element.className = 'selection-item';
        element.textContent = item;

        if (isLocked) {
            element.classList.add('locked', 'selected');
            return element;
        }

        // Check if already selected
        if (this.selections[category].includes(item)) {
            element.classList.add('selected');
        }

        element.addEventListener('click', () => {
            this.toggleSelection(item, category, element);
        });

        return element;
    }

    toggleSelection(item, category, element) {
        // Special handling for "All genres"
        if (category === 'genres' && item === 'all') {
            const allSelected = element.classList.contains('selected');
            
            if (allSelected) {
                // Deselect "All genres"
                this.selections[category] = [];
                element.classList.remove('selected');
                // Deselect all other genre items
                document.querySelectorAll('#genre-grid .selection-item:not(:first-child)').forEach(el => {
                    el.classList.remove('selected');
                });
            } else {
                // Select "All genres" - clear other selections
                this.selections[category] = ['all'];
                element.classList.add('selected');
                // Deselect all other genre items
                document.querySelectorAll('#genre-grid .selection-item:not(:first-child)').forEach(el => {
                    el.classList.remove('selected');
                });
            }
        } else if (category === 'genres' && item !== 'all') {
            // Deselect "All genres" if selecting specific genre
            const allGenresElement = document.querySelector('#genre-grid .selection-item:first-child');
            if (allGenresElement && allGenresElement.classList.contains('selected')) {
                allGenresElement.classList.remove('selected');
                const allIndex = this.selections[category].indexOf('all');
                if (allIndex > -1) {
                    this.selections[category].splice(allIndex, 1);
                }
            }
            
            // Normal toggle for specific genre
            const index = this.selections[category].indexOf(item);
            if (index > -1) {
                this.selections[category].splice(index, 1);
                element.classList.remove('selected');
            } else {
                this.selections[category].push(item);
                element.classList.add('selected');
            }
        } else {
            // Normal toggle for other categories
            const index = this.selections[category].indexOf(item);
            
            if (index > -1) {
                // Remove from selection
                this.selections[category].splice(index, 1);
                element.classList.remove('selected');
            } else {
                // Add to selection
                this.selections[category].push(item);
                element.classList.add('selected');
            }
        }

        this.updateNextButton(category);
        
        // Progressive saving - save to database when selections change
        this.saveProgressiveSelection(category);
    }

    // Save selections progressively as user makes them
    async saveProgressiveSelection(category) {
        // Skip database saving for now to avoid errors
        try {
            console.log(`💾 Progressive save skipped for: ${category}`, this.selections[category]);
        } catch (error) {
            console.warn(`⚠️ Progressive save failed for ${category}:`, error);
        }
    }

    updateNextButton(category) {
        const buttons = {
            platforms: this.elements.platformNextBtn,
            genres: this.elements.genreNextBtn,
            films: this.elements.filmNextBtn,
            dishes: this.elements.dishNextBtn,
            snacks: this.elements.snacksNextBtn,
            drinks: this.elements.drinksFinishBtn
        };

        const button = buttons[category];
        if (button) {
            button.disabled = this.selections[category].length === 0;
        }
    }

    finishSelection() {
        console.log('finishSelection called');
        
        // Skip database saving for now - just show final screen
        console.log('Skipping database save, showing final screen...');
        
        console.log('About to render final summary');
        this.renderFinalSummary();
        
        console.log('About to show final screen');
        this.showScreen('final');
        
        console.log('Final screen should be visible now');
        
        // Save to localStorage as backup (non-blocking)
        try {
            const data = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                selections: this.selections,
                userAgent: navigator.userAgent
            };
            
            let savedData = [];
            const existing = localStorage.getItem('dateNightHistory');
            if (existing) {
                savedData = JSON.parse(existing);
            }
            
            savedData.push(data);
            
            // Keep only last 50 entries
            if (savedData.length > 50) {
                savedData = savedData.slice(-50);
            }
            
            localStorage.setItem('dateNightHistory', JSON.stringify(savedData));
            localStorage.setItem('dateNightSelections', JSON.stringify(data));
            
            console.log('✅ Backup saved to localStorage');
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    renderFinalSummary() {
        const summary = document.createElement('div');
        
        Object.keys(this.selections).forEach(categoryKey => {
            if (this.selections[categoryKey].length > 0) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'summary-category';
                
                const title = document.createElement('h4');
                title.textContent = categories[categoryKey].name;
                categoryDiv.appendChild(title);
                
                const itemsDiv = document.createElement('div');
                itemsDiv.className = 'summary-items';
                
                this.selections[categoryKey].forEach(item => {
                    const tag = document.createElement('span');
                    tag.className = 'summary-tag';
                    tag.textContent = item;
                    itemsDiv.appendChild(tag);
                });
                
                categoryDiv.appendChild(itemsDiv);
                summary.appendChild(categoryDiv);
            }
        });
        
        this.elements.finalSummary.innerHTML = '';
        this.elements.finalSummary.appendChild(summary);
    }

    async saveData() {
        console.log('💾 Saving data to database...');
        
        const data = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            selections: this.selections,
            userAgent: navigator.userAgent
        };

        try {
            // Save each category to database
            const savePromises = [];
            
            if (this.selections.platforms.length > 0) {
                savePromises.push(this.db.saveSelections('platforms', this.selections.platforms));
            }
            if (this.selections.genres.length > 0) {
                savePromises.push(this.db.saveSelections('genres', this.selections.genres));
            }
            if (this.selections.films.length > 0) {
                savePromises.push(this.db.saveSelections('films', this.selections.films));
            }
            if (this.selections.dishes.length > 0) {
                savePromises.push(this.db.saveSelections('dishes', this.selections.dishes));
            }
            if (this.selections.snacks.length > 0) {
                savePromises.push(this.db.saveSelections('snacks', this.selections.snacks));
            }
            if (this.selections.drinks.length > 0) {
                savePromises.push(this.db.saveSelections('drinks', this.selections.drinks));
            }

            // Wait for all saves to complete
            await Promise.all(savePromises);
            
            // Mark as completed
            await this.db.completeSelection();
            
            console.log('✅ All data saved to database successfully');
            
            // Also save to localStorage as backup
            let savedData = [];
            const existing = localStorage.getItem('dateNightHistory');
            if (existing) {
                savedData = JSON.parse(existing);
            }
            
            savedData.push(data);
            
            // Keep only last 50 entries
            if (savedData.length > 50) {
                savedData = savedData.slice(-50);
            }
            
            localStorage.setItem('dateNightHistory', JSON.stringify(savedData));
            localStorage.setItem('dateNightSelections', JSON.stringify(data));
            
            console.log('✅ Backup saved to localStorage');
            
        } catch (error) {
            console.error('❌ Error saving data:', error);
            
            // Fallback to localStorage only
            try {
                let savedData = [];
                const existing = localStorage.getItem('dateNightHistory');
                if (existing) {
                    savedData = JSON.parse(existing);
                }
                
                savedData.push(data);
                
                if (savedData.length > 50) {
                    savedData = savedData.slice(-50);
                }
                
                localStorage.setItem('dateNightHistory', JSON.stringify(savedData));
                localStorage.setItem('dateNightSelections', JSON.stringify(data));
                
                console.log('⚠️ Saved to localStorage only (database unavailable)');
            } catch (localError) {
                console.error('❌ Failed to save even to localStorage:', localError);
            }
        }
    }

    addSortSelector() {
        const filmScreen = this.screens.film;
        const screenHeader = filmScreen.querySelector('.screen-header');
        
        // Remove existing sort selector if any
        const existingSelector = screenHeader.querySelector('.sort-selector');
        if (existingSelector) {
            existingSelector.remove();
        }
        
        // Create sort selector container
        const sortContainer = document.createElement('div');
        sortContainer.className = 'sort-selector';
        
        const sortLabel = document.createElement('label');
        sortLabel.textContent = 'Zoradiť podľa:';
        sortLabel.className = 'sort-label';
        
        const sortSelect = document.createElement('select');
        sortSelect.className = 'sort-select';
        
        // Add sort options
        const sortOptions = this.tmdb.getSortOptions();
        sortOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            optionElement.textContent = option.name;
            if (option.id === this.currentSort) {
                optionElement.selected = true;
            }
            sortSelect.appendChild(optionElement);
        });
        
        // Add event listener for sort change
        sortSelect.addEventListener('change', async (e) => {
            this.currentSort = e.target.value;
            await this.reloadMoviesWithSort();
        });
        
        sortContainer.appendChild(sortLabel);
        sortContainer.appendChild(sortSelect);
        screenHeader.appendChild(sortContainer);
    }

    async reloadMoviesWithSort() {
        try {
            // Show loading
            this.elements.filmGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">Načítavam filmy...</p>';
            
            // If "All genres" is selected, pass empty array to get all genres
            const genresToSearch = this.selections.genres.includes('all') ? [] : this.selections.genres;
            
            const result = await this.tmdb.discoverMovies(
                this.selections.platforms,
                genresToSearch,
                100,
                this.currentSort
            );

            // Convert TMDB movies to our format
            this.movieData = result.movies.map(movie => this.tmdb.formatMovie(movie));
            
            // Render updated movies
            this.renderMovieGrid();
            
        } catch (error) {
            console.error('Error reloading movies:', error);
            this.elements.filmGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Chyba pri načítavaní filmov.</p>';
        }
    }

    resetApp() {
        this.selections = {
            platforms: [],
            genres: [],
            films: [],
            dishes: [],
            snacks: [],
            drinks: []
        };
        
        this.renderGrids();
        this.showScreen('welcome');
        
        // Reset button states
        this.elements.platformNextBtn.disabled = true;
        this.elements.genreNextBtn.disabled = true;
        this.elements.filmNextBtn.disabled = true;
        this.elements.dishNextBtn.disabled = true;
        this.elements.snacksNextBtn.disabled = true;
        this.elements.drinksFinishBtn.disabled = true; // No drinks pre-selected
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DateNightApp();
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}