import categories from './categories.js';

// App version for cache busting
const APP_VERSION = '2.9';
console.log(`Date Night App v${APP_VERSION} loaded`);

class DateNightApp {
    constructor() {
        this.version = APP_VERSION;
        this.currentScreen = 'welcome';
        this.selections = {
            films: [],
            dishes: [],
            snacks: [],
            drinks: ['Beer'] // Beer is pre-selected and locked
        };
        
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
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
            
            filmGrid: document.getElementById('film-grid'),
            filmNextBtn: document.getElementById('film-next-btn'),
            
            dishGrid: document.getElementById('dish-grid'),
            dishNextBtn: document.getElementById('dish-next-btn'),
            
            snacksGrid: document.getElementById('snacks-grid'),
            snacksNextBtn: document.getElementById('snacks-next-btn'),
            
            drinksGrid: document.getElementById('drinks-grid'),
            drinksFinishBtn: document.getElementById('drinks-finish-btn'),
            
            finalSummary: document.getElementById('final-summary'),
            startOverBtn: document.getElementById('start-over-btn')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderGrids();
        this.showScreen('welcome');
    }

    setupEventListeners() {
        // Start button
        this.elements.startBtn.addEventListener('click', () => {
            this.showScreen('film');
        });

        // Back button
        this.elements.backBtn.addEventListener('click', () => {
            this.goBack();
        });

        // Next buttons
        this.elements.filmNextBtn.addEventListener('click', () => {
            this.showScreen('dish');
        });

        this.elements.dishNextBtn.addEventListener('click', () => {
            this.showScreen('snacks');
        });

        this.elements.snacksNextBtn.addEventListener('click', () => {
            this.showScreen('drinks');
        });

        this.elements.drinksFinishBtn.addEventListener('click', () => {
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
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        this.screens[screenName].classList.add('active');

        // Update navigation
        this.updateNavigation(screenName);
        this.currentScreen = screenName;
    }

    updateNavigation(screenName) {
        const titles = {
            welcome: 'Date Night',
            film: '🎬 Filmy',
            dish: '🍽️ Hlavné jedlo',
            snacks: '🍿 Občerstvenie',
            drinks: '🥂 Nápoje',
            final: '💕 Hotovo!'
        };

        this.elements.appTitle.textContent = titles[screenName];
        
        // Show/hide back button
        if (screenName === 'welcome' || screenName === 'final') {
            this.elements.backBtn.style.display = 'none';
        } else {
            this.elements.backBtn.style.display = 'flex';
        }
    }

    goBack() {
        const navigation = {
            film: 'welcome',
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
        this.renderFilmGrid();
        this.renderDishGrid();
        this.renderSnacksGrid();
        this.renderDrinksGrid();
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

        this.updateNextButton(category);
    }

    updateNextButton(category) {
        const buttons = {
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

    async finishSelection() {
        await this.saveData();
        this.renderFinalSummary();
        this.showScreen('final');
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
        const data = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            selections: this.selections,
            userAgent: navigator.userAgent
        };

        try {
            // Save to localStorage
            let savedData = [];
            const existing = localStorage.getItem('dateNightHistory');
            if (existing) {
                savedData = JSON.parse(existing);
            }
            
            // Add new entry
            savedData.push(data);
            
            // Keep only last 50 entries
            if (savedData.length > 50) {
                savedData = savedData.slice(-50);
            }
            
            localStorage.setItem('dateNightHistory', JSON.stringify(savedData));
            localStorage.setItem('dateNightSelections', JSON.stringify(data));
            
            console.log('Data saved successfully:', data);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    resetApp() {
        this.selections = {
            films: [],
            dishes: [],
            snacks: [],
            drinks: ['Beer']
        };
        
        this.renderGrids();
        this.showScreen('welcome');
        
        // Reset button states
        this.elements.filmNextBtn.disabled = true;
        this.elements.dishNextBtn.disabled = true;
        this.elements.snacksNextBtn.disabled = true;
        this.elements.drinksFinishBtn.disabled = false; // Beer is pre-selected
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