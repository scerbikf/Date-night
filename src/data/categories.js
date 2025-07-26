const categories = {
    films: {
        id: 1,
        name: 'Filmy',
        items: [
            'Naruto',
            'Oppenheimer', 
            'YouTube',
            'The Other Boleyn Girl',
            'Don\'t Look Up',
            'Songbirds and Snakes',
            'The Dark Knight'
        ]
    },
    dishes: {
        id: 2,
        name: 'Hlavné jedlo',
        items: [
            'Pizzovníky a škoricovníky',
            'Čína',
            'Hamburger',
            'Pizza',
            'McDonald\'s'
        ]
    },
    snacks: {
        id: 3,
        name: 'Občerstvenie',
        items: [
            'Hrozno',
            'Chrumky',
            'Čučoriedky',
            'Zmrzlina',
            'Chipsy',
            'Čokoláda'
        ]
    },
    drinks: {
        id: 4,
        name: 'Nápoje',
        items: [
            { name: 'Beer', locked: true },
            'Captain Morgan',
            'Víno',
            'Radler',
            'Drinky'
        ]
    }
};

export default categories;