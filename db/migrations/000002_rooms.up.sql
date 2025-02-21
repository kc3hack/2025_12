CREATE TABLE rooms (
    id VARCHAR(36) NOT NULL,
    room_name VARCHAR(36) NOT NULL,
    creator_id VARCHAR(36) NULL,
    url VARCHAR(255) UNIQUE NOT NULL,
    expired_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE SET NULL
);
