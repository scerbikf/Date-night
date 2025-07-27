const categories = {
    platforms: {
        id: 0,
        name: 'Streamovacie platformy',
        items: [] // Dynamic from TMDB
    },
    genres: {
        id: 1,
        name: 'Žánre',
        items: [] // Dynamic from TMDB
    },
    films: {
        id: 2,
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
        id: 3,
        name: 'Hlavné jedlo',
        items: [
            'Pizzovníky a škoricovníky',
            'Spaghetti Carbonara',
            'Čína',
            'Hamburger',
            'Pizza',
            'McDonald'
        ]
    },
    snacks: {
        id: 4,
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
        id: 5,
        name: 'Nápoje',
        items: [
            'Pivo',
            'Captain Morgan',
            'Víno',
            'Radler',
            'Drinky'
        ]
    }
};

export default categories;