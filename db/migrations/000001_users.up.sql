CREATE TABLE users (
    id VARCHAR(36) NOT NULL,
    nickname VARCHAR(255),
    image_url VARCHAR(255) NULL,
    introduction VARCHAR(1000) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
