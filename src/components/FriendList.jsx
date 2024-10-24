import React from 'react';

function FriendList({ friends, onSelectFriend }) {
  return (
    <div className="bg-white p-4 mt-2 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Friend List</h3>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id} className="mb-2">
            <button 
              className="w-full text-left p-2 hover:bg-gray-200"
              onClick={() => onSelectFriend(friend)} // Pilih teman
            >
              {friend.email}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FriendList;
