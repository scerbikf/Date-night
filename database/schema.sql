-- Date Night App Database Schema
-- Created: 2025-01-27

-- Drop database if exists (use with caution in production)
-- DROP DATABASE IF EXISTS date_night_app;

-- Create database
CREATE DATABASE IF NOT EXISTS date_night_app 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE date_night_app;

-- Users table for future user management
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Evening selections main table
CREATE TABLE evening_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    session_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
);

-- Platform selections
CREATE TABLE platform_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evening_selection_id INT NOT NULL,
    platform_name VARCHAR(100) NOT NULL,
    platform_id VARCHAR(50),
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (evening_selection_id) REFERENCES evening_selections(id) ON DELETE CASCADE,
    INDEX idx_evening_selection (evening_selection_id),
    INDEX idx_platform_name (platform_name)
);

-- Genre selections
CREATE TABLE genre_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evening_selection_id INT NOT NULL,
    genre_name VARCHAR(100) NOT NULL,
    genre_id INT,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (evening_selection_id) REFERENCES evening_selections(id) ON DELETE CASCADE,
    INDEX idx_evening_selection (evening_selection_id),
    INDEX idx_genre_name (genre_name)
);

-- Film selections
CREATE TABLE film_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evening_selection_id INT NOT NULL,
    film_title VARCHAR(255) NOT NULL,
    film_id INT,
    tmdb_id INT,
    poster_path VARCHAR(255),
    overview TEXT,
    release_date DATE,
    vote_average DECIMAL(3,1),
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (evening_selection_id) REFERENCES evening_selections(id) ON DELETE CASCADE,
    INDEX idx_evening_selection (evening_selection_id),
    INDEX idx_film_title (film_title),
    INDEX idx_tmdb_id (tmdb_id)
);

-- Food selections (dishes)
CREATE TABLE dish_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evening_selection_id INT NOT NULL,
    dish_name VARCHAR(255) NOT NULL,
    dish_category VARCHAR(100),
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (evening_selection_id) REFERENCES evening_selections(id) ON DELETE CASCADE,
    INDEX idx_evening_selection (evening_selection_id),
    INDEX idx_dish_name (dish_name)
);

-- Snack selections
CREATE TABLE snack_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evening_selection_id INT NOT NULL,
    snack_name VARCHAR(255) NOT NULL,
    snack_category VARCHAR(100),
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (evening_selection_id) REFERENCES evening_selections(id) ON DELETE CASCADE,
    INDEX idx_evening_selection (evening_selection_id),
    INDEX idx_snack_name (snack_name)
);

-- Drink selections
CREATE TABLE drink_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evening_selection_id INT NOT NULL,
    drink_name VARCHAR(255) NOT NULL,
    drink_category VARCHAR(100),
    is_locked BOOLEAN DEFAULT FALSE,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (evening_selection_id) REFERENCES evening_selections(id) ON DELETE CASCADE,
    INDEX idx_evening_selection (evening_selection_id),
    INDEX idx_drink_name (drink_name)
);

-- Analytics table for tracking popular choices
CREATE TABLE selection_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_type ENUM('platform', 'genre', 'film', 'dish', 'snack', 'drink') NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_id VARCHAR(100),
    selection_count INT DEFAULT 1,
    last_selected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_item (item_type, item_name),
    INDEX idx_item_type (item_type),
    INDEX idx_selection_count (selection_count),
    INDEX idx_last_selected (last_selected)
);

-- Create a view for complete evening selections
CREATE VIEW complete_evening_selections AS
SELECT 
    es.id,
    es.session_id,
    es.created_at,
    es.completed_at,
    es.status,
    GROUP_CONCAT(DISTINCT ps.platform_name) as platforms,
    GROUP_CONCAT(DISTINCT gs.genre_name) as genres,
    GROUP_CONCAT(DISTINCT fs.film_title) as films,
    GROUP_CONCAT(DISTINCT ds.dish_name) as dishes,
    GROUP_CONCAT(DISTINCT sns.snack_name) as snacks,
    GROUP_CONCAT(DISTINCT drs.drink_name) as drinks
FROM evening_selections es
LEFT JOIN platform_selections ps ON es.id = ps.evening_selection_id
LEFT JOIN genre_selections gs ON es.id = gs.evening_selection_id
LEFT JOIN film_selections fs ON es.id = fs.evening_selection_id
LEFT JOIN dish_selections ds ON es.id = ds.evening_selection_id
LEFT JOIN snack_selections sns ON es.id = sns.evening_selection_id
LEFT JOIN drink_selections drs ON es.id = drs.evening_selection_id
GROUP BY es.id, es.session_id, es.created_at, es.completed_at, es.status;

-- Insert sample analytics data
INSERT INTO selection_analytics (item_type, item_name, selection_count) VALUES
('platform', 'Netflix', 0),
('platform', 'HBO Max', 0),
('platform', 'Amazon Prime', 0),
('platform', 'Disney+', 0),
('genre', 'Akčný', 0),
('genre', 'Komédia', 0),
('genre', 'Romantický', 0),
('genre', 'Horror', 0),
('genre', 'Thriller', 0),
('genre', 'Sci-Fi', 0),
('dish', 'Pizza', 0),
('dish', 'Sushi', 0),
('dish', 'Burger', 0),
('dish', 'Pasta', 0),
('snack', 'Popcorn', 0),
('snack', 'Nachos', 0),
('snack', 'Čokoláda', 0),
('drink', 'Beer', 0),
('drink', 'Víno', 0),
('drink', 'Koktail', 0);
