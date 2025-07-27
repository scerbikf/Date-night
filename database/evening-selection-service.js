const dbConfig = require('./config');

class EveningSelectionService {
    constructor() {
        this.db = null;
    }

    async initialize() {
        this.db = dbConfig.getPool();
    }

    // Generate unique session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Create new evening selection session
    async createEveningSelection(sessionId, ipAddress = null, userAgent = null) {
        try {
            const [result] = await this.db.execute(
                `INSERT INTO evening_selections (session_id, ip_address, user_agent, status) 
                 VALUES (?, ?, ?, 'in_progress')`,
                [sessionId, ipAddress, userAgent]
            );

            return {
                id: result.insertId,
                sessionId,
                status: 'in_progress'
            };
        } catch (error) {
            console.error('Error creating evening selection:', error);
            throw error;
        }
    }

    // Get evening selection by session ID
    async getEveningSelection(sessionId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM evening_selections WHERE session_id = ?',
                [sessionId]
            );

            return rows[0] || null;
        } catch (error) {
            console.error('Error getting evening selection:', error);
            throw error;
        }
    }

    // Save platform selections
    async savePlatformSelections(eveningSelectionId, platforms) {
        try {
            // Clear existing selections
            await this.db.execute(
                'DELETE FROM platform_selections WHERE evening_selection_id = ?',
                [eveningSelectionId]
            );

            // Insert new selections
            if (platforms && platforms.length > 0) {
                const values = platforms.map(platform => [eveningSelectionId, platform.name, platform.id || null]);
                const placeholders = values.map(() => '(?, ?, ?)').join(', ');
                
                await this.db.execute(
                    `INSERT INTO platform_selections (evening_selection_id, platform_name, platform_id) VALUES ${placeholders}`,
                    values.flat()
                );

                // Update analytics
                await this.updateAnalytics('platform', platforms);
            }
        } catch (error) {
            console.error('Error saving platform selections:', error);
            throw error;
        }
    }

    // Save genre selections
    async saveGenreSelections(eveningSelectionId, genres) {
        try {
            await this.db.execute(
                'DELETE FROM genre_selections WHERE evening_selection_id = ?',
                [eveningSelectionId]
            );

            if (genres && genres.length > 0) {
                const values = genres.map(genre => [eveningSelectionId, genre.name, genre.id || null]);
                const placeholders = values.map(() => '(?, ?, ?)').join(', ');
                
                await this.db.execute(
                    `INSERT INTO genre_selections (evening_selection_id, genre_name, genre_id) VALUES ${placeholders}`,
                    values.flat()
                );

                await this.updateAnalytics('genre', genres);
            }
        } catch (error) {
            console.error('Error saving genre selections:', error);
            throw error;
        }
    }

    // Save film selections
    async saveFilmSelections(eveningSelectionId, films) {
        try {
            await this.db.execute(
                'DELETE FROM film_selections WHERE evening_selection_id = ?',
                [eveningSelectionId]
            );

            if (films && films.length > 0) {
                const values = films.map(film => [
                    eveningSelectionId, 
                    film.title, 
                    film.id || null, 
                    film.tmdb_id || null,
                    film.poster_path || null,
                    film.overview || null,
                    film.release_date || null,
                    film.vote_average || null
                ]);
                const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
                
                await this.db.execute(
                    `INSERT INTO film_selections (evening_selection_id, film_title, film_id, tmdb_id, poster_path, overview, release_date, vote_average) 
                     VALUES ${placeholders}`,
                    values.flat()
                );

                await this.updateAnalytics('film', films);
            }
        } catch (error) {
            console.error('Error saving film selections:', error);
            throw error;
        }
    }

    // Save dish selections
    async saveDishSelections(eveningSelectionId, dishes) {
        try {
            await this.db.execute(
                'DELETE FROM dish_selections WHERE evening_selection_id = ?',
                [eveningSelectionId]
            );

            if (dishes && dishes.length > 0) {
                const values = dishes.map(dish => [eveningSelectionId, dish.name || dish, dish.category || null]);
                const placeholders = values.map(() => '(?, ?, ?)').join(', ');
                
                await this.db.execute(
                    `INSERT INTO dish_selections (evening_selection_id, dish_name, dish_category) VALUES ${placeholders}`,
                    values.flat()
                );

                await this.updateAnalytics('dish', dishes);
            }
        } catch (error) {
            console.error('Error saving dish selections:', error);
            throw error;
        }
    }

    // Save snack selections
    async saveSnackSelections(eveningSelectionId, snacks) {
        try {
            await this.db.execute(
                'DELETE FROM snack_selections WHERE evening_selection_id = ?',
                [eveningSelectionId]
            );

            if (snacks && snacks.length > 0) {
                const values = snacks.map(snack => [eveningSelectionId, snack.name || snack, snack.category || null]);
                const placeholders = values.map(() => '(?, ?, ?)').join(', ');
                
                await this.db.execute(
                    `INSERT INTO snack_selections (evening_selection_id, snack_name, snack_category) VALUES ${placeholders}`,
                    values.flat()
                );

                await this.updateAnalytics('snack', snacks);
            }
        } catch (error) {
            console.error('Error saving snack selections:', error);
            throw error;
        }
    }

    // Save drink selections
    async saveDrinkSelections(eveningSelectionId, drinks) {
        try {
            await this.db.execute(
                'DELETE FROM drink_selections WHERE evening_selection_id = ?',
                [eveningSelectionId]
            );

            if (drinks && drinks.length > 0) {
                const values = drinks.map(drink => [
                    eveningSelectionId, 
                    drink.name || drink, 
                    drink.category || null,
                    drink.isLocked || false
                ]);
                const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
                
                await this.db.execute(
                    `INSERT INTO drink_selections (evening_selection_id, drink_name, drink_category, is_locked) VALUES ${placeholders}`,
                    values.flat()
                );

                await this.updateAnalytics('drink', drinks);
            }
        } catch (error) {
            console.error('Error saving drink selections:', error);
            throw error;
        }
    }

    // Complete evening selection
    async completeEveningSelection(eveningSelectionId) {
        try {
            await this.db.execute(
                'UPDATE evening_selections SET status = "completed", completed_at = NOW() WHERE id = ?',
                [eveningSelectionId]
            );
        } catch (error) {
            console.error('Error completing evening selection:', error);
            throw error;
        }
    }

    // Get complete evening selection with all details
    async getCompleteEveningSelection(sessionId) {
        try {
            // Get main selection
            const evening = await this.getEveningSelection(sessionId);
            if (!evening) return null;

            // Get all related selections
            const [platforms] = await this.db.execute(
                'SELECT * FROM platform_selections WHERE evening_selection_id = ?',
                [evening.id]
            );

            const [genres] = await this.db.execute(
                'SELECT * FROM genre_selections WHERE evening_selection_id = ?',
                [evening.id]
            );

            const [films] = await this.db.execute(
                'SELECT * FROM film_selections WHERE evening_selection_id = ?',
                [evening.id]
            );

            const [dishes] = await this.db.execute(
                'SELECT * FROM dish_selections WHERE evening_selection_id = ?',
                [evening.id]
            );

            const [snacks] = await this.db.execute(
                'SELECT * FROM snack_selections WHERE evening_selection_id = ?',
                [evening.id]
            );

            const [drinks] = await this.db.execute(
                'SELECT * FROM drink_selections WHERE evening_selection_id = ?',
                [evening.id]
            );

            return {
                ...evening,
                platforms,
                genres,
                films,
                dishes,
                snacks,
                drinks
            };
        } catch (error) {
            console.error('Error getting complete evening selection:', error);
            throw error;
        }
    }

    // Update analytics
    async updateAnalytics(itemType, items) {
        try {
            for (const item of items) {
                const itemName = item.name || item.title || item;
                const itemId = item.id || null;

                await this.db.execute(
                    `INSERT INTO selection_analytics (item_type, item_name, item_id, selection_count, last_selected) 
                     VALUES (?, ?, ?, 1, NOW()) 
                     ON DUPLICATE KEY UPDATE 
                     selection_count = selection_count + 1, 
                     last_selected = NOW()`,
                    [itemType, itemName, itemId]
                );
            }
        } catch (error) {
            console.error('Error updating analytics:', error);
            // Don't throw here as analytics shouldn't break the main flow
        }
    }

    // Get analytics data
    async getAnalytics(itemType = null, limit = 50) {
        try {
            let query = 'SELECT * FROM selection_analytics';
            let params = [];

            if (itemType) {
                query += ' WHERE item_type = ?';
                params.push(itemType);
            }

            query += ' ORDER BY selection_count DESC, last_selected DESC LIMIT ?';
            params.push(limit);

            const [rows] = await this.db.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error getting analytics:', error);
            throw error;
        }
    }

    // Get recent evening selections
    async getRecentSelections(limit = 20) {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM complete_evening_selections ORDER BY created_at DESC LIMIT ?',
                [limit]
            );
            return rows;
        } catch (error) {
            console.error('Error getting recent selections:', error);
            throw error;
        }
    }
}

module.exports = EveningSelectionService;
