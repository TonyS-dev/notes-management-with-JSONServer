# Notes Management Application with JSON Server


## 📋 Coder Information

- **Name:** Antonio Carlos Santiago Rodriguez
- **Clan:** Macondo
- **Email:** santiagor.acarlos@gmail.com
- **Training:** JavaScript Module 3 - Week 3

## 🚀 Project Description

Advanced notes management application that demonstrates JavaScript fundamentals including data structures (Set, Map, Object), CRUD operations, DOM manipulation, event handling, HTTP requests, and modern UI/UX patterns. The system provides a complete note-taking experience with categorization, search, archiving, and interactive features, now powered by a JSON Server backend.

## 🛠️ Technologies Used

- **HTML5:** Semantic structure with accessibility features
- **CSS3:** Modern styling with CSS Grid, Flexbox, and animations
- **JavaScript (Vanilla):** Advanced ES6+ features and data structures
- **JSON Server:** RESTful API backend for data persistence
- **Fetch API:** Modern HTTP request handling
- **DOM API:** Dynamic content manipulation and event handling
- **Async/Await:** Modern asynchronous programming patterns

## 📁 Project Structure

```
notes-management-app-with-JsonServer/
├── index.html                    # Main HTML structure
├── db.json                       # JSON Server database file
├── assets/
│   └── styles/                   # Complete CSS styling
│      └── styles.css           
├── src/
│   └── gestion_datos.js         # Core JavaScript application with HTTP requests
└── README.md                    # Project documentation
```

## 🎯 Implemented Features

### Data Structures Implementation
- ✅ **for...in Loop** - Iterate through notes database object
- ✅ **for...of Loop** - Process Set of unique categories
- ✅ **forEach() Method** - Handle Map of notes metadata
- ✅ **Set Data Structure** - Unique categories management
- ✅ **Map Data Structure** - Notes metadata tracking


### HTTP Operations (Server-First Approach)
- ✅ **GET Requests** - Fetch notes from JSON Server
- ✅ **POST Requests** - Create new notes on server
- ✅ **PUT Requests** - Update existing notes on server
- ✅ **PATCH Requests** - Partial updates (archive functionality)
- ✅ **DELETE Requests** - Permanent note deletion from server

### CRUD Operations
- ✅ **Create Notes** - Add new notes with server validation
- ✅ **Read Notes** - Display and search functionality
- ✅ **Update Notes** - Edit existing note content
- ✅ **Delete Notes** - Permanent deletion with confirmation
- ✅ **Archive Notes** - Soft delete functionality

### Advanced Features
- ✅ **Category Management** - Dynamic category system
- ✅ **Search Functionality** - Title and content search
- ✅ **Note Filtering** - Filter by categories
- ✅ **Note Duplication** - Copy existing notes
- ✅ **Expandable Notes** - Detailed view with metadata
- ✅ **Success Messages** - User feedback system
- ✅ **Error Handling** - Comprehensive HTTP error management

### User Interface
- ✅ **Responsive Design** - Mobile and desktop compatible
- ✅ **Modal System** - Create/edit note modals
- ✅ **Dropdown Menus** - Note action menus
- ✅ **Smooth Animations** - CSS transitions and transforms
- ✅ **Interactive Elements** - Hover effects and visual feedback

### Data Management
- ✅ **Note Metadata** - Word count, reading time, status tracking
- ✅ **Category System** - Available and selected categories
- ✅ **Status Management** - Active/archived note states
- ✅ **Date Tracking** - Creation and modification dates
- ✅ **Server Synchronization** - Real-time data persistence

## 🎮 How to Use

### Prerequisites
1. **Install Node.js:** Ensure Node.js is installed on your system
2. **Install JSON Server:** Run `npm install -g json-server`

### Getting Started
1. **Start JSON Server:**
   ```bash
   json-server --watch db.json --port 3000
   ```
   Server will run at: `http://localhost:3000`

2. **Open the application:**
   - Launch python HTTP server:
   ```bash
   python -m http.server 8000
   ```
   - Open your browser and navigate to `http://localhost:8000`
   - Ensure JSON Server is running before opening the app
   - Open Developer Console (F12) to see data structure demonstrations

### Creating Notes
1. Click "**+ New note**" button
2. Fill in the note title and content
3. Add categories by typing and clicking "**Add**"
4. Select from available categories
5. Click "**Save Note**" to create (saves to server)

### Managing Notes
- **📝 Edit:** Click the pencil icon or "Edit" in dropdown
- **📋 Duplicate:** Create a copy of existing note
- **📁 Archive:** Soft delete (hide from active view)
- **🗑️ Delete:** Permanent deletion with confirmation

### Interactive Features
- **Click any note** to expand/collapse detailed view
- **Escape key** to close modals and collapse notes
- **Enter key** in category input to add category quickly
- **Click outside modals** to close them


## 🔧 Technical Implementation

### Server Configuration
```javascript
const API_URL = "http://localhost:3000/notes";
```

### HTTP Request Handler
```javascript
async function httpRequest(method, url, body = null) {
    try {
        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : null,
        };

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("❌ HTTP request error:", error);
        throw error;
    }
}
```

### Core Functions

#### Server-First CRUD Operations
```javascript
// Create note (POST to server)
await httpRequest("POST", API_URL, noteTemplate);

// Update note (PUT to server)
await httpRequest("PUT", `${API_URL}/${id}`, updatedNote);

// Archive note (PATCH to server)
await httpRequest("PATCH", `${API_URL}/${id}`, { isActive: false });

// Delete note (DELETE from server)
await httpRequest("DELETE", `${API_URL}/${id}`);

// Get all notes (GET from server)
const response = await fetch(API_URL);
notesDatabase = await response.json();
```

#### UI Management
```javascript
showNoteModal(note)
toggleNoteExpansion(noteId)
updateSelectedCategories()
updateAvailableCategories()
```

## 🚀 Installation and Usage

1. **Download the project:**
   ```bash
   git clone https://github.com/TonyS-dev/notes-management-app.git
   cd notes-management-app-with-JsonServer
   ```

2. **Install JSON Server:**
   ```bash
   npm install -g json-server
   ```

3. **Start the server:**
   ```bash
   json-server --watch db.json --port 3000
   ```

4. **Open a http port with python:**
   ```bash
   python -m http.server 8000
   ```

5. **View console output:**
   - Open Developer Tools (F12)
   - Check Console tab for HTTP request logs and data structure demonstrations
   - Interact with the application to see real-time server communication

## 📊 Console Output Features

The application provides comprehensive console logging:

- **HTTP Request Tracking** - Shows all server communications (GET, POST, PUT, PATCH, DELETE)
- **Data Structures Demonstration** - Shows for...in, for...of, forEach usage
- **Object Methods** - Demonstrates Object.keys(), Object.values(), Object.entries()
- **CRUD Operations** - Logs all create, update, delete operations with server responses
- **Error Handling** - Comprehensive HTTP error logging
- **Navigation Tracking** - Shows active navigation states

## 🌐 API Endpoints

The JSON Server provides the following RESTful endpoints:

- **GET** `/notes` - Retrieve all notes
- **GET** `/notes/:id` - Retrieve a specific note
- **POST** `/notes` - Create a new note
- **PUT** `/notes/:id` - Update an entire note
- **PATCH** `/notes/:id` - Partially update a note
- **DELETE** `/notes/:id` - Delete a note

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Smooth Animations** - CSS transitions for all interactions
- **Responsive Layout** - Works on mobile and desktop
- **Visual Feedback** - Success messages and hover effects
- **Accessibility** - Proper focus states and semantic HTML
- **Interactive Elements** - Expandable notes, dropdown menus, modal system
- **Loading States** - Visual feedback during server operations

## 🔮 Future Enhancements

- **Authentication System** - User login and registration
- **Export Modules** - Export notes to various formats
- **Single Page Application (SPA)** - Transition to a full SPA with routing

## 📝 Code Quality

- **JSDoc Documentation** - Complete function documentation
- **ES6+ Features** - Modern JavaScript syntax
- **Modular Design** - Well-organized code structure
- **Error Handling** - Comprehensive validation and HTTP error management
- **Performance Optimized** - Efficient DOM manipulation and async operations
- **Server-First Architecture** - Ensures data consistency and reliability

## 🛠️ Development Notes

### Server-First Approach
All CRUD operations follow a server-first pattern:
1. **Server Action** - Perform operation on JSON Server
2. **Success Handling** - Update local data only after server confirms
3. **Error Handling** - Graceful fallback with user notification

### Error Management
```javascript
try {
    // SERVER FIRST: Operation on server
    await httpRequest(method, url, data);
    
    // SUCCESS: Update local data
    // Update UI and show success message
} catch (error) {
    console.error("❌ Operation failed:", error);
    showSuccessMessage("Operation failed. Please try again.", "error");
}
```

---

by Antonio Carlos Santiago Rodriguez