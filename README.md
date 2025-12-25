# 🏚️ Granny Escape Game

A real-life horror escape game where players hunt for clues while avoiding being caught by a blindfolded "Granny"!

## 🎮 Game Overview

Players must find and enter 4-digit codes hidden around your location while avoiding being caught by Granny. Each code corresponds to a level, and players can complete levels in any order. The first player to complete all levels wins!

## 📱 Setup Instructions

### Option 1: Local WiFi Hosting (for iOS)

**iPhone/iPad Server Apps (available in App Store):**
- **"Server for iOS"** by Luke Brickell (recommended)
- **"HTTP Server"** (search for various versions)
- **"WebServer"** by Verto Studio

**Setup:**
1. **Download one of the server apps** from the App Store
2. **Transfer game files** to your iPhone:
   - Download all files (index.html, styles.css, game.js)
   - Use AirDrop, iCloud Drive, or Files app
3. **Open in the server app**:
   - Add the folder containing the files
   - Start the server
   - Note the URL (e.g., `http://192.168.1.50:8080`)
4. **Share the URL** with all players
5. **All players connect** on the same WiFi network

### Option 2: GitHub Pages (Internet accessible)

1. Create a GitHub repository
2. Upload the files
3. Enable GitHub Pages in repository settings
4. Share the public URL with players

## 🎯 How to Play

### For the Host:

1. **Open the game** in your browser
2. **Tap "Host Game"**
3. **Configure the game**:
   - Set number of levels (e.g., 5)
   - Set lives per player (e.g., 3)
   - **Sound Interval Min**: Set minimum time between sounds (5-60s)
   - **Sound Interval Max**: Set maximum time between sounds (5-60s)
   - **Sound Volume**: Adjust from 0-100%
   - Tap "Configure Levels"
4. **For each level**:
   - Enter a 4-digit code (e.g., 1234)
   - Enter a clue (e.g., "Check behind the painting")
5. **Tap "Start Game"**
6. **Share the game code** with all players
7. **Hide the codes** around your location (write them on paper, hide objects with the numbers, etc.)

### For Players:

1. **Open the game** on your phone
2. **Tap "Join Game"**
3. **Enter**:
   - The game code (from host)
   - Your name
4. **Read the clues** on your dashboard
5. **Find the codes** around the location
6. **Enter codes** as you find them
7. **If caught by Granny**: Tap "I'VE BEEN CAUGHT" (lose a life)
8. **Win by**: Completing all levels first!

### For Granny:

1. **Wear a blindfold** (honor system!)
2. **Hunt for players** by sound/movement
3. **When you catch someone**: Call out their name
4. **Players self-report** by tapping the "CAUGHT" button
5. **Goal**: Eliminate all players before someone escapes!

## 🎲 Game Mechanics

- **Lives**: Each player starts with X lives (set by host)
- **Getting Caught**: Lose 1 life when caught by Granny
- **Elimination**: Lose all lives = eliminated from game
- **Levels**: Complete in any order by finding and entering codes
- **Clues**: Only show for incomplete levels
- **Winner**: First player to complete all levels
- **Game Over**: When someone wins OR everyone is eliminated

## 📊 Features

- ✅ Real-time leaderboard showing all players
- ✅ Lives tracking with heart icons
- ✅ Progress bars for level completion
- ✅ Dynamic clue display (only incomplete levels)
- ✅ **Creepy sound effects** at random intervals
- ✅ **Customizable min-max sound timing** (5-60 second range for each)
- ✅ **Adjustable sound volume** (0-100%)
- ✅ **Sound countdown timer** showing time until next sound
- ✅ Winner announcement
- ✅ Elimination tracking
- ✅ Mobile-optimized interface
- ✅ Works on same WiFi network

## 🔧 Technical Details

- **Frontend only**: HTML, CSS, JavaScript
- **Storage**: localStorage for game state
- **Sync**: Polling-based updates (1-second intervals)
- **No backend required**: Perfect for quick setup
- **Mobile-first**: Optimized for phones/tablets

## 💡 Tips for Best Experience

1. **WiFi Connection**: Ensure all players are on the same WiFi network
2. **Keep Screens On**: Tell players to disable auto-lock or keep screen active
3. **Sound Volume**: Test sound volume before starting - creepy tones add atmosphere!
4. **Sound Intervals**: 
   - **Frequent sounds**: Min 5s, Max 15s (intense, constant tension)
   - **Moderate**: Min 10s, Max 30s (balanced gameplay)
   - **Suspenseful**: Min 20s, Max 60s (rare, unpredictable scares)
   - **Fixed timing**: Set Min = Max for consistent intervals
5. **Lighting**: Play in dim lighting for horror effect
6. **Boundaries**: Set clear play area boundaries
7. **Safety**: Ensure Granny has a safe way to navigate blindfolded

## 🎨 Customization Ideas

- Add creepy sound effects when codes are entered
- Use colored lights or flashlights for atmosphere
- Create themed clues (horror movie references, etc.)
- Add time limits for extra challenge
- Create difficulty levels (easy = more lives, hard = fewer lives)

## 🐛 Troubleshooting

**Players can't join:**
- Check that all devices are on same WiFi
- Verify game code is entered correctly
- Try refreshing the browser

**Progress not updating:**
- Refresh the page
- Check localStorage is enabled in browser
- Ensure game code matches

**Game state lost:**
- localStorage clears when browser data is cleared
- Recommend keeping host device active throughout game

## 📝 Version Info

**Version**: 1.0  
**Last Updated**: December 2024  
**Compatibility**: All modern browsers (Chrome, Safari, Firefox)

---

Enjoy your Granny Escape Game! 👻
