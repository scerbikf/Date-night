// Database API Service for Date Night App
class DatabaseService {
    constructor() {
        this.sessionId = null;
        this.baseUrl = '';
        this.fallbackMode = false;
    }

    // Initialize session
    async initializeSession() {
        try {
            const response = await fetch('/api/evening-selection/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.sessionId = result.sessionId;
                this.fallbackMode = result.fallback || false;
                console.log(`📝 Session initialized: ${this.sessionId}${this.fallbackMode ? ' (fallback mode)' : ''}`);
                return this.sessionId;
            } else {
                throw new Error('Failed to initialize session');
            }
        } catch (error) {
            console.error('Error initializing session:', error);
            // Generate fallback session ID
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.fallbackMode = true;
            console.log(`📝 Fallback session created: ${this.sessionId}`);
            return this.sessionId;
        }
    }

    // Save selections for a category
    async saveSelections(category, selections) {
        if (!this.sessionId) {
            await this.initializeSession();
        }

        try {
            console.log(`💾 Saving ${category}:`, selections);
            
            const response = await fetch(`/api/evening-selection/${this.sessionId}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category,
                    selections
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ ${category} saved successfully`);
                return true;
            } else {
                console.error(`❌ Failed to save ${category}:`, result.error);
                return false;
            }
        } catch (error) {
            console.error(`Error saving ${category}:`, error);
            return false;
        }
    }

    // Complete the evening selection
    async completeSelection() {
        if (!this.sessionId) {
            console.error('No session ID available');
            return false;
        }

        try {
            console.log('🎯 Completing evening selection...');
            
            const response = await fetch(`/api/evening-selection/${this.sessionId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Evening selection completed');
                return true;
            } else {
                console.error('❌ Failed to complete selection:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Error completing selection:', error);
            return false;
        }
    }

    // Get current selection data
    async getSelectionData() {
        if (!this.sessionId) {
            console.error('No session ID available');
            return null;
        }

        try {
            const response = await fetch(`/api/evening-selection/${this.sessionId}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                console.error('Failed to get selection data:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error getting selection data:', error);
            return null;
        }
    }

    // Get session ID
    getSessionId() {
        return this.sessionId;
    }

    // Check if in fallback mode
    isFallbackMode() {
        return this.fallbackMode;
    }
}

export default DatabaseService;
