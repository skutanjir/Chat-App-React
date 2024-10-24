import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { FaSignOutAlt, FaEnvelope, FaUserPlus, FaSmile, FaPaperclip, FaExpand, FaCheckDouble } from 'react-icons/fa';
import Picker from 'emoji-picker-react';
import AddFriend from './AddFriend';
import FriendRequestsModal from './FriendRequestsModal';
import FriendList from './FriendList';
import './Chat.css';
import axios from 'axios';

// Initialize socket connection
const socket = io.connect("http://localhost:3001");

function Chat() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [newFriendRequestCount, setNewFriendRequestCount] = useState(0);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [showFriendRequestsModal, setShowFriendRequestsModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [typingStatus, setTypingStatus] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showFullscreenImage, setShowFullscreenImage] = useState(false);
    const [fullscreenImageUrl, setFullscreenImageUrl] = useState(null);
    const [readReceipts, setReadReceipts] = useState({}); // Track read receipts
    const [onlineFriends, setOnlineFriends] = useState([]); // Track online users
    const chatEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const onEmojiClick = (event, emojiObject) => {
        setMessage(prevMessage => prevMessage + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const handleTyping = () => {
        socket.emit('typing', { user: localStorage.getItem('userId'), to: selectedFriend.id });
    };

    const handleStopTyping = () => {
        socket.emit('stop typing', { user: localStorage.getItem('userId'), to: selectedFriend.id });
    };

    useEffect(() => {
        if (selectedFriend) {
            setInterval(() => {
                fetchMessages(selectedFriend.id);
            }, 100);
        }
        return () => clearInterval();
    }, [selectedFriend]);

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                const res = await axios.get('http://localhost:3001/friend-requests', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setFriendRequests(res.data);
                setNewFriendRequestCount(res.data.length);
            } catch (error) {
                console.error('Error fetching friend requests:', error);
            }
        };

        const fetchFriends = async () => {
            try {
                const res = await axios.get('http://localhost:3001/friends', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setFriends(res.data);
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriendRequests();
        fetchFriends();

        socket.on("chat message", (msg) => {
            if (msg.sender_id === selectedFriend?.id || msg.receiver_id === selectedFriend?.id) {
                setChat(prevChat => [...prevChat, msg]);
                scrollToBottom();
                setReadReceipts(prev => ({ ...prev, [msg.id]: true }));
                // Trigger browser notification
                if (document.hidden && Notification.permission === "granted") {
                    new Notification("New message from " + selectedFriend.email, {
                        body: msg.message || 'You received an attachment!',
                    });
                }
            }
        });

        socket.on('typing', (data) => {
            if (data.user !== localStorage.getItem('userId')) {
                setTypingStatus(`${data.user} is typing...`);
            }
        });

        socket.on('stop typing', () => {
            setTypingStatus('');
        });

        socket.on('user status', (status) => {
            setOnlineFriends(status.onlineUsers);
        });

        return () => {
            socket.off("chat message");
            socket.off('typing');
            socket.off('stop typing');
            socket.off('user status');
        };
    }, [selectedFriend]);

    const fetchMessages = async (friendId) => {
        try {
            const res = await axios.get(`http://localhost:3001/messages/${friendId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setChat(res.data);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSelectFriend = (friend) => {
        setSelectedFriend(friend);
        fetchMessages(friend.id);
        socket.emit('join', localStorage.getItem('userId'));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
            setPreviewUrl(URL.createObjectURL(file)); // Create a preview URL for the file
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!selectedFriend || (!message && !attachment)) {
            alert("Please enter a message or select a file.");
            return;
        }

        const formData = new FormData();
        formData.append('message', message);
        formData.append('receiverId', selectedFriend.id);
        if (attachment) formData.append('file', attachment);

        try {
            await axios.post('http://localhost:3001/send-message', formData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
            });

            socket.emit("chat message", {
                message,
                sender_id: localStorage.getItem('userId'),
                receiver_id: selectedFriend.id,
                timestamp: new Date(),
                attachment
            });

            setMessage('');
            setAttachment(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleImageClick = (url) => {
        setFullscreenImageUrl(url);
        setShowFullscreenImage(true);
    };

    const closeFullscreen = () => {
        setShowFullscreenImage(false);
        setFullscreenImageUrl(null);
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
                <h2>Chat</h2>
                <div className="relative">
                    <FaEnvelope className="text-2xl cursor-pointer" onClick={() => setShowFriendRequestsModal(true)} />
                    {newFriendRequestCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                            {newFriendRequestCount}
                        </span>
                    )}
                </div>
                <button onClick={() => setShowAddFriend(true)} className="ml-4 p-2 bg-green-500 text-white rounded-md flex items-center">
                    <FaUserPlus className="mr-2" /> Add Friend
                </button>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                }} className="text-white p-2"><FaSignOutAlt size={24} /></button>
            </div>

            <div className="flex h-full">
                <div className="w-1/4 p-4 bg-gray-100 overflow-auto">
                    <FriendList friends={friends} onSelectFriend={handleSelectFriend} onlineFriends={onlineFriends} />
                </div>

                <div className="w-3/4 p-4 bg-white flex flex-col justify-between">
                    {selectedFriend ? (
                        <>
                            <div className="flex-grow overflow-auto mb-4">
                                <h3 className="text-lg font-semibold mb-4">
                                    Chatting with {selectedFriend.email} 
                                    {onlineFriends.includes(selectedFriend.id) ? (
                                        <span className="text-green-500 ml-2">Online</span>
                                    ) : (
                                        <span className="text-gray-500 ml-2">Last seen: {selectedFriend.last_seen}</span>
                                    )}
                                </h3>
                                <div className="chat-messages">
                                    {chat.map((msg, index) => (
                                        <div key={index} className={`message ${msg.sender_id === selectedFriend.id ? 'incoming' : 'outgoing'}`}>
                                            <p>{msg.message}</p>
                                            {msg.file_url && (
                                                msg.file_url.endsWith('.mp4') ? (
                                                    <video controls style={{ maxWidth: '200px', cursor: 'pointer' }}>
                                                        <source src={`http://localhost:3001${msg.file_url}`} type="video/mp4" />
                                                    </video>
                                                ) : (
                                                    <img 
                                                        src={`http://localhost:3001${msg.file_url}`} 
                                                        alt="attachment" 
                                                        style={{ maxWidth: '200px', cursor: 'pointer' }}
                                                        onClick={() => handleImageClick(`http://localhost:3001${msg.file_url}`)}
                                                    />
                                                )
                                            )}
                                            {readReceipts[msg.id] && <FaCheckDouble className="text-blue-500 ml-2" />}
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                {typingStatus && <div className="typing-indicator">{typingStatus}</div>}
                            </div>

                            {previewUrl && (
                                <div className="preview-container">
                                    <img src={previewUrl} alt="Preview" style={{ maxWidth: '100px' }} />
                                    <button onClick={() => setPreviewUrl(null)}>Remove</button>
                                </div>
                            )}

                            <form onSubmit={sendMessage} className="p-4 bg-gray-200 flex">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                        handleTyping();
                                    }}
                                    onKeyUp={handleStopTyping}
                                    placeholder="Type your message..."
                                    className="flex-grow p-2 rounded-md"
                                />
                                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="ml-2 p-2 bg-gray-200">
                                    <FaSmile />
                                </button>
                                <input type="file" onChange={handleFileChange} id="attachment" style={{ display: 'none' }} />
                                <label htmlFor="attachment" className="ml-2 p-2 bg-gray-200 cursor-pointer">
                                    <FaPaperclip />
                                </label>
                                <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded-md">Send</button>
                            </form>
                            {showEmojiPicker && <Picker onEmojiClick={onEmojiClick} />}
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center">
                            <p className="text-gray-500">Select a friend to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>

            {showFullscreenImage && (
                <div className="fullscreen-modal">
                    <div className="fullscreen-content">
                        <img src={fullscreenImageUrl} alt="Full" />
                        <button className="close-btn" onClick={closeFullscreen}>X</button>
                    </div>
                </div>
            )}

            {showAddFriend && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AddFriend onFriendAdded={() => setShowAddFriend(false)} />
                        <button className="close-modal-button" onClick={() => setShowAddFriend(false)}>Close</button>
                    </div>
                </div>
            )}

            {showFriendRequestsModal && (
                <FriendRequestsModal friendRequests={friendRequests} onClose={() => setShowFriendRequestsModal(false)} />
            )}
        </div>
    );
}

export default Chat;
