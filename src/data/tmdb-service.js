// TMDB API Service
class TMDBService {
    constructor() {
        this.apiKey = '7eba8585d2a10b2e34570c16a3b44e81';
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
        
        // Watch Provider IDs for Slovakia
        this.providers = {
            netflix: 8,
            hbo: 384,
            disney: 337,
            amazon: 119
        };
    }

    // Get available genres
    async getGenres() {
        try {
            const response = await fetch(
                `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=sk-SK`
            );
            const data = await response.json();
            return data.genres || [];
        } catch (error) {
            console.error('Error fetching genres:', error);
            return this.getFallbackGenres();
        }
    }

    // Fallback genres if API fails
    getFallbackGenres() {
        return [
            { id: 28, name: 'Akčný' },
            { id: 12, name: 'Dobrodružný' },
            { id: 16, name: 'Animovaný' },
            { id: 35, name: 'Komédia' },
            { id: 80, name: 'Kriminálny' },
            { id: 99, name: 'Dokumentárny' },
            { id: 18, name: 'Dráma' },
            { id: 10751, name: 'Rodinný' },
            { id: 14, name: 'Fantasy' },
            { id: 36, name: 'Historický' },
            { id: 27, name: 'Horror' },
            { id: 10402, name: 'Hudobný' },
            { id: 9648, name: 'Mysteriózny' },
            { id: 10749, name: 'Romantický' },
            { id: 878, name: 'Sci-Fi' },
            { id: 10770, name: 'TV Film' },
            { id: 53, name: 'Thriller' },
            { id: 10752, name: 'Vojnový' },
            { id: 37, name: 'Western' }
        ];
    }

    // Get platforms data
    getPlatforms() {
        return [
            {
                id: 'netflix',
                name: 'Netflix',
                logo: '🔴',
                providerId: this.providers.netflix,
                color: '#e50914'
            },
            {
                id: 'hbo',
                name: 'HBO Max',
                logo: '⚫',
                providerId: this.providers.hbo,
                color: '#9b59b6'
            },
            {
                id: 'disney',
                name: 'Disney+',
                logo: '🏰',
                providerId: this.providers.disney,
                color: '#1e3a8a'
            },
            {
                id: 'amazon',
                name: 'Prime Video',
                logo: '📺',
                providerId: this.providers.amazon,
                color: '#00a8e1'
            }
        ];
    }

    // Discover movies based on platforms and genres
    async discoverMovies(selectedPlatforms = [], selectedGenres = [], page = 1) {
        try {
            const providerIds = selectedPlatforms
                .map(platformId => this.providers[platformId])
                .filter(id => id)
                .join('|');
            
            const genreIds = selectedGenres.join('|');
            
            let url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=sk-SK&page=${page}&sort_by=popularity.desc`;
            
            if (providerIds) {
                url += `&with_watch_providers=${providerIds}&watch_region=SK`;
            }
            
            if (genreIds) {
                url += `&with_genres=${genreIds}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            return {
                movies: data.results || [],
                totalPages: data.total_pages || 1,
                totalResults: data.total_results || 0
            };
        } catch (error) {
            console.error('Error discovering movies:', error);
            return { movies: [], totalPages: 1, totalResults: 0 };
        }
    }

    // Get movie details
    async getMovieDetails(movieId) {
        try {
            const response = await fetch(
                `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=sk-SK&append_to_response=watch/providers`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    // Format movie for display
    formatMovie(movie) {
        return {
            id: movie.id,
            title: movie.title,
            originalTitle: movie.original_title,
            overview: movie.overview,
            posterPath: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : null,
            backdropPath: movie.backdrop_path ? `${this.imageBaseUrl}${movie.backdrop_path}` : null,
            releaseDate: movie.release_date,
            voteAverage: movie.vote_average,
            genreIds: movie.genre_ids || []
        };
    }
}

export default TMDBService;
