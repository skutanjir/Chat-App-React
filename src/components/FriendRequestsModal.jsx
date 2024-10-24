import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FriendRequestsModal = ({ onClose }) => {
    const [friendRequests, setFriendRequests] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchFriendRequests = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:3001/friend-requests', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFriendRequests(response.data); // Only incoming requests
            } catch (error) {
                console.error('Error fetching friend requests:', error);
                setError('Error fetching friend requests');
            }
        };

        fetchFriendRequests();
    }, []);

    const handleAccept = async (senderId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:3001/accept-friend-request', 
            { senderId }, 
            {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200) {
                setFriendRequests(prevRequests => prevRequests.filter(req => req.sender_id !== senderId));
            } else {
                throw new Error('Failed to accept the request');
            }
        } catch (err) {
            setError('Failed to accept friend request.');
            console.error('Error accepting friend request:', err);
        }
    };
    

    const handleDecline = async (senderId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:3001/decline-friend-request', { senderId }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200) {
                setFriendRequests(prevRequests => prevRequests.filter(req => req.sender_id !== senderId));
                setMessage('Friend request declined');
            } else {
                throw new Error('Failed to decline the request');
            }
        } catch (err) {
            setError('Failed to decline friend request.');
            console.error('Error declining friend request:', err);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
                {friendRequests.length > 0 ? (
                    <ul>
                        {friendRequests.map(request => (
                            <li key={request.sender_id} className="flex justify-between items-center py-2 border-b">
                                <span>{request.email}</span>
                                <div>
                                    <button 
                                        className="bg-green-500 text-white px-2 py-1 rounded mr-2" 
                                        onClick={() => handleAccept(request.sender_id)}
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        className="bg-red-500 text-white px-2 py-1 rounded" 
                                        onClick={() => handleDecline(request.sender_id)}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p>No friend requests</p>}
                <button 
                    className="mt-4 bg-gray-300 text-black px-4 py-2 rounded" 
                    onClick={onClose}
                >
                    Close
                </button>
                {message && <p className="text-green-500 mt-2">{message}</p>}
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default FriendRequestsModal;
