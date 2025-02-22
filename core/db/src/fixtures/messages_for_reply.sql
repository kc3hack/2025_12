INSERT INTO messages (
    id, user_id, room_id, content, reply_to_id, created_at
) VALUES
(
    '0', '0', '0', 'hello', NULL, NOW() - INTERVAL 5 HOUR
),
(
    '1', '0', '0', 'hello', NULL, NOW() - INTERVAL 5 HOUR
),
(
    '2', '0', '0', 'reply to first', '0', NOW()
)
