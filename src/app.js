const categories = require('./data/categories');

document.addEventListener('DOMContentLoaded', () => {
    const categoryContainer = document.getElementById('category-container');
    
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category');
        
        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category.name;
        categoryElement.appendChild(categoryTitle);
        
        const itemList = document.createElement('ul');
        category.items.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.textContent = item;
            itemList.appendChild(itemElement);
        });
        
        categoryElement.appendChild(itemList);
        categoryContainer.appendChild(categoryElement);
    });
});