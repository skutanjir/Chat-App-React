import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import FriendRequests from './components/FriendRequests';

const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

function App() {
    return (
        <div className="h-screen bg-gray-100">
            <Router>
                <Routes>
                    <Route path="/" element={isAuthenticated() ? <Navigate to="/chat" /> : <Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/chat" element={isAuthenticated() ? <Chat /> : <Navigate to="/login" />} />
                    <Route path="/friend-requests" element={isAuthenticated() ? <FriendRequests /> : <Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
