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
    async discoverMovies(selectedPlatforms = [], selectedGenres = [], maxResults = 100, sortBy = 'popularity.desc') {
        try {
            const providerIds = selectedPlatforms
                .map(platformId => this.providers[platformId])
                .filter(id => id)
                .join('|');
            
            const genreIds = selectedGenres.join('|');
            
            let allMovies = [];
            let currentPage = 1;
            const maxPages = Math.ceil(maxResults / 20); // API returns ~20 results per page
            
            while (allMovies.length < maxResults && currentPage <= maxPages && currentPage <= 10) {
                let url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=sk-SK&page=${currentPage}&sort_by=${sortBy}`;
                
                if (providerIds) {
                    url += `&with_watch_providers=${providerIds}&watch_region=SK`;
                }
                
                if (genreIds) {
                    url += `&with_genres=${genreIds}`;
                }
                
                // Add quality filters
                url += '&vote_count.gte=10'; // At least 10 votes
                url += '&primary_release_date.gte=1990-01-01'; // Movies from 1990 onwards
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (!data.results || data.results.length === 0) {
                    break; // No more results
                }
                
                allMovies = allMovies.concat(data.results);
                currentPage++;
                
                // Break if we've reached the total pages available
                if (currentPage > data.total_pages) {
                    break;
                }
            }
            
            return {
                movies: allMovies.slice(0, maxResults),
                totalPages: Math.ceil(allMovies.length / 20),
                totalResults: allMovies.length
            };
        } catch (error) {
            console.error('Error discovering movies:', error);
            return { movies: [], totalPages: 1, totalResults: 0 };
        }
    }

    // Get available sort options
    getSortOptions() {
        return [
            { id: 'popularity.desc', name: 'Najobľúbenejšie' },
            { id: 'vote_average.desc', name: 'Najlepšie hodnotené' },
            { id: 'primary_release_date.desc', name: 'Najnovšie' },
            { id: 'revenue.desc', name: 'Najúspešnejšie' },
            { id: 'vote_count.desc', name: 'Najviac hodnotené' }
        ];
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
