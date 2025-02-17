CREATE TABLE users (
    id VARCHAR(36) NOT NULL,
    nickname VARCHAR(255) NULL,
    introduction VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
