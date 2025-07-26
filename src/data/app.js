import categories from './categories.js';

document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('category-list');
    const itemList = document.getElementById('item-list');
    const itemsSection = document.getElementById('items');

    function displayCategories() {
        categoryList.innerHTML = '';
        categories.forEach(category => {
            const categoryCard = document.createElement('li');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `<h3>${category.name}</h3>`;
            categoryCard.addEventListener('click', () => displayItems(category));
            categoryList.appendChild(categoryCard);
        });
    }

    function displayItems(category) {
        itemsSection.style.display = 'block';
        itemList.innerHTML = '';
        category.items.forEach(item => {
            const itemCard = document.createElement('li');
            itemCard.className = 'item-card';
            itemCard.textContent = item;
            itemCard.addEventListener('click', () => {
                const selected = document.querySelector('.item-card.selected');
                if (selected) {
                    selected.classList.remove('selected');
                }
                itemCard.classList.add('selected');
            });
            itemList.appendChild(itemCard);
        });
    }

    displayCategories();
});