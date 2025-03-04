CREATE TABLE messages (
    id VARCHAR(36) NOT NULL,
    room_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NULL,
    content TEXT NOT NULL,
    reply_to_id VARCHAR(36) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (reply_to_id) REFERENCES messages (id) ON DELETE SET NULL
);
