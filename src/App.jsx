// src/App.jsx
import React from 'react';
import StudentBooking from './components/StudentBooking';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>KABALE UNIVERSITY</h1>
          <p>Smart Hostel Allocation System</p>
        </div>
      </header>

      <main className="app-main">
        <StudentBooking />
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Kabale University - Faculty of Computing, Library & Information Science</p>
      </footer>
    </div>
  );
}

export default App;