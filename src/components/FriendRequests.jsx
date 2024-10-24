import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FriendRequestsModal from './FriendRequestsModal';

const FriendRequests = () => {
    const [friendRequests, setFriendRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchFriendRequests = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:3001/friend-requests', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setFriendRequests(response.data); // Only incoming requests
            } catch (error) {
                setMessage('Error fetching friend requests');
            }
        };

        fetchFriendRequests();
    }, []);

    const handleAcceptRequest = async (senderId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:3001/accept-friend-request', { senderId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Remove the accepted request from the state
            setFriendRequests(friendRequests.filter(request => request.sender_id !== senderId));
            setMessage('Friend request accepted');
        } catch (error) {
            setMessage('Error accepting friend request');
        }
    };

    const handleDeclineRequest = async (senderId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:3001/decline-friend-request', { senderId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Remove the declined request from the state
            setFriendRequests(friendRequests.filter(request => request.sender_id !== senderId));
            setMessage('Friend request declined');
        } catch (error) {
            setMessage('Error declining friend request');
        }
    };

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>View Friend Requests</button>
            {isModalOpen && (
                <FriendRequestsModal 
                    friendRequests={friendRequests} 
                    onClose={() => setIsModalOpen(false)} 
                    onAccept={handleAcceptRequest}  
                    onDecline={handleDeclineRequest}
                />
            )}
            {message && <p>{message}</p>}
        </div>
    );
};

export default FriendRequests;
