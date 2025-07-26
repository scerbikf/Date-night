import categories from './categories.js';

class DateNightApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.selectedCategory = null;
        this.selectedItem = null;
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            categories: document.getElementById('categories-screen'),
            items: document.getElementById('items-screen'),
            result: document.getElementById('result-screen')
        };
        this.elements = {
            appTitle: document.getElementById('app-title'),
            backBtn: document.getElementById('back-btn'),
            startBtn: document.getElementById('start-btn'),
            categoryGrid: document.getElementById('category-grid'),
            categoryTitle: document.getElementById('category-title'),
            itemsGrid: document.getElementById('items-grid'),
            randomPickBtn: document.getElementById('random-pick-btn'),
            selectedItem: document.getElementById('selected-item'),
            pickAgainBtn: document.getElementById('pick-again-btn'),
            newCategoryBtn: document.getElementById('new-category-btn')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.showScreen('welcome');
    }

    setupEventListeners() {
        // Navigation
        this.elements.startBtn.addEventListener('click', () => {
            this.showScreen('categories');
        });

        this.elements.backBtn.addEventListener('click', () => {
            this.goBack();
        });

        // Random pick
        this.elements.randomPickBtn.addEventListener('click', () => {
            this.randomPick();
        });

        // Result actions
        this.elements.pickAgainBtn.addEventListener('click', () => {
            this.showScreen('items');
        });

        this.elements.newCategoryBtn.addEventListener('click', () => {
            this.showScreen('categories');
        });
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active', 'prev');
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
            categories: 'Kategórie',
            items: this.selectedCategory?.name || 'Výber',
            result: 'Výsledok'
        };

        this.elements.appTitle.textContent = titles[screenName];
        
        // Show/hide back button
        if (screenName === 'welcome') {
            this.elements.backBtn.style.display = 'none';
        } else {
            this.elements.backBtn.style.display = 'flex';
        }
    }

    goBack() {
        const navigation = {
            categories: 'welcome',
            items: 'categories',
            result: 'items'
        };

        const previousScreen = navigation[this.currentScreen];
        if (previousScreen) {
            this.showScreen(previousScreen);
        }
    }

    renderCategories() {
        this.elements.categoryGrid.innerHTML = '';
        
        categories.forEach(category => {
            const categoryElement = this.createCategoryCard(category);
            this.elements.categoryGrid.appendChild(categoryElement);
        });
    }

    createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'category-card';
        
        const icons = {
            'What to watch': '🎬',
            'Snacks': '🍿',
            'Main Dishes': '🍽️'
        };

        card.innerHTML = `
            <div class="category-icon">${icons[category.name] || '📱'}</div>
            <h3>${category.name}</h3>
        `;

        card.addEventListener('click', () => {
            this.selectCategory(category);
        });

        return card;
    }

    selectCategory(category) {
        this.selectedCategory = category;
        this.renderItems(category);
        this.showScreen('items');
    }

    renderItems(category) {
        this.elements.categoryTitle.textContent = category.name;
        this.elements.itemsGrid.innerHTML = '';

        category.items.forEach(item => {
            const itemElement = this.createItemCard(item);
            this.elements.itemsGrid.appendChild(itemElement);
        });
    }

    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.textContent = item;

        card.addEventListener('click', () => {
            this.selectItem(item);
        });

        return card;
    }

    selectItem(item) {
        // Remove previous selection
        const previouslySelected = this.elements.itemsGrid.querySelector('.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }

        // Add selection to clicked item
        const itemCards = Array.from(this.elements.itemsGrid.children);
        const clickedCard = itemCards.find(card => card.textContent === item);
        if (clickedCard) {
            clickedCard.classList.add('selected');
        }

        this.selectedItem = item;
        this.showResult(item);
    }

    randomPick() {
        if (!this.selectedCategory || this.selectedCategory.items.length === 0) {
            return;
        }

        const randomIndex = Math.floor(Math.random() * this.selectedCategory.items.length);
        const randomItem = this.selectedCategory.items[randomIndex];
        
        this.selectItem(randomItem);
    }

    showResult(item) {
        this.elements.selectedItem.textContent = item;
        this.showScreen('result');
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