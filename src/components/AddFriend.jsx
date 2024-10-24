import React, { useState } from 'react';
import axios from 'axios';
import './AddFriend.css'; // Tambahkan file CSS untuk styling

const AddFriend = ({ onFriendAdded }) => {
    const [friendEmail, setFriendEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddFriend = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post('http://localhost:3001/friend-request', 
            { friendEmail }, 
            {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Friend request sent successfully!');
            setFriendEmail(''); // Clear input after success
            onFriendAdded(); // Callback untuk menutup modal atau refresh daftar teman
        } catch (error) {
            setMessage('Error sending friend request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-friend-container">
            <h2 className="title">Add Friend</h2>
            <form className="friend-form" onSubmit={handleAddFriend}>
                <input 
                    type="email" 
                    className="input-email"
                    value={friendEmail} 
                    onChange={(e) => setFriendEmail(e.target.value)} 
                    placeholder="Enter friend's email" 
                    required 
                    disabled={loading} // Disable input while loading
                />
                <button 
                    className="submit-button"
                    type="submit" 
                    disabled={!friendEmail || loading}
                >
                    {loading ? 'Sending...' : 'Send Request'}
                </button>
            </form>
            {message && <p className={message.includes('successfully') ? 'message success' : 'message error'}>{message}</p>}
        </div>
    );
};

export default AddFriend;
