# Date Night App 🌃✨

Mobilná webová aplikácia pre plánovanie dokonalého večera s progresívnym výberom obsahu, jedla a nápojov. Teraz s MySQL databázou pre ukladanie a analytics!

## 🚀 Nové funkcie v v3.0

- **MySQL databáza** - Centralizované ukladanie všetkých výberov
- **Progresívne ukladanie** - Dáta sa ukladajú po každom kroku
- **Analytics** - Sledovanie popularity výberov
- **Fallback režim** - Aplikácia funguje aj bez databázy
- **Admin panel** - Prehľad uložených dát
- **API endpoints** - RESTful API pre všetky operácie

## 📋 Požiadavky

- **Node.js** (v14 alebo vyšší)
- **MySQL** (v5.7 alebo vyšší) alebo **MariaDB**
- **npm** alebo **yarn**

## 🛠️ Inštalácia

### 1. Klonujte repozitár
```bash
git clone <repository-url>
cd date-night-webapp
```

### 2. Nainštalujte závislosti
```bash
npm install
```

### 3. Nastavte databázu

#### A) Automatický setup (odporúčané)
```bash
npm run setup-db
```

#### B) Manuálny setup
1. Vytvorte MySQL databázu:
```sql
CREATE DATABASE date_night_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Spustite SQL schému:
```bash
mysql -u your_username -p date_night_app < database/schema.sql
```

### 4. Konfigurácia
Vytvorte `.env` súbor (automaticky sa vytvorí z `.env.example`):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=date_night_app
DB_PORT=3306
PORT=3001
```

### 5. Spustite aplikáciu
```bash
npm start
```

Aplikácia bude dostupná na:
- **App**: http://localhost:3001
- **Admin**: http://localhost:3001/admin

## 📊 Databázová štruktúra

### Hlavné tabuľky:
- `evening_selections` - Hlavné záznamy večerov
- `platform_selections` - Výber streamovacích platforiem
- `genre_selections` - Výber žánrov
- `film_selections` - Výber filmov (s TMDB údajmi)
- `dish_selections` - Výber hlavných jedál
- `snack_selections` - Výber občerstvenia
- `drink_selections` - Výber nápojov
- `selection_analytics` - Analytics a štatistiky

### Analytics view:
- `complete_evening_selections` - Kompletný prehľad všetkých výberov

## 🔧 API Endpoints

### Hlavné operácie:
```bash
POST /api/evening-selection/start           # Začať nový výber
POST /api/evening-selection/:id/save        # Uložiť kategóriu
POST /api/evening-selection/:id/complete    # Dokončiť výber
GET  /api/evening-selection/:id             # Získať údaje výberu
```

### Analytics:
```bash
GET /api/analytics?type=platform&limit=10   # Analytics podľa typu
GET /api/recent-selections?limit=20         # Nedávne výbery
```

## 🏗️ Vývoj

### Development režim:
```bash
npm run dev  # Nodemon s auto-restart
```

### Client-only režim:
```bash
npm run client  # Live-server bez backendu
```

### Databázové príkazy:
```bash
npm run setup-db    # Setup databázy
npm run db:setup    # Alias pre setup
```

## 📱 Funkcie

### Pre používateľov:
- **Responsívny dizajn** - Optimalizované pre mobily
- **PWA podpora** - Inštalovateľné ako app
- **Progresívny výber** - Krok za krokom
- **Automatické ukladanie** - Žiadna strata dát
- **Smooth transitions** - Plynulé animácie

### Pre adminov:
- **Analytics dashboard** - Prehľad popularity
- **Export dát** - CSV/JSON export
- **Real-time štatistiky** - Aktuálne údaje
- **Session management** - Správa sessions

## 🔄 Fallback režim

Ak databáza nie je dostupná, aplikácia automaticky prepne do fallback režimu:
- Ukladanie do localStorage
- Zachovanie všetkých funkcií
- Automatické obnovenie pri opätovnom pripojení

## 🗂️ Štruktúra projektu

```
date-night-webapp/
├── database/                 # Databázové súbory
│   ├── config.js            # Konfigurácia MySQL
│   ├── evening-selection-service.js  # Databázové služby
│   └── schema.sql           # SQL schéma
├── scripts/                 # Utility skripty
│   └── setup-database.js    # Setup databázy
├── src/data/                # Frontend logika
│   ├── app.js              # Hlavná aplikácia
│   ├── database-service.js  # API komunikácia
│   ├── categories.js       # Dáta kategórií
│   └── tmdb-service.js     # TMDB API
├── public/                  # Statické súbory
│   └── styles.css          # CSS štýly
├── server.js               # Express server
├── index.html              # Hlavná stránka
└── admin.html              # Admin panel
```

## 🚨 Troubleshooting

### Databázové problémy:
```bash
# Skontrolujte MySQL status
sudo systemctl status mysql

# Reštartujte MySQL
sudo systemctl restart mysql

# Skontrolujte logs
tail -f /var/log/mysql/error.log
```

### Connection issues:
1. Skontrolujte `.env` credentials
2. Overte MySQL port (default: 3306)
3. Skontrolujte firewall nastavenia
4. Overte user privileges

### Performance:
- Databáza má indexy pre rýchle vyhľadávanie
- Connection pooling pre efektívnosť
- Automatické cleanup starých sessions

## 📈 Monitoring

### Logs:
```bash
# Server logs
tail -f logs/app.log

# Database logs
tail -f logs/database.log

# Error tracking
tail -f logs/error.log
```

### Analytics queries:
```sql
-- Top platformy
SELECT platform_name, COUNT(*) as count 
FROM platform_selections 
GROUP BY platform_name 
ORDER BY count DESC;

-- Populárne žánry
SELECT genre_name, COUNT(*) as count 
FROM genre_selections 
GROUP BY genre_name 
ORDER BY count DESC;
```

## 🔐 Bezpečnosť

- SQL injection protection (prepared statements)
- Input validation a sanitization
- Rate limiting na API endpoints
- Session security
- CORS nastavenia

## 📄 Licencia

MIT License - Slobodné použitie a modifikácia.

---

**Autor**: Filip Scerbik  
**Verzia**: 3.0.0  
**Posledná aktualizácia**: January 2025
