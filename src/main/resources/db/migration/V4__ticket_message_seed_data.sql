INSERT INTO ticket_messages (ticket_id, sender_id, body, type)
VALUES
-- Ticket 1: Public conversation
(1, 1, 'I was charged twice for my subscription. Please help.', 'PUBLIC'),
(1, 2, 'We are investigating the duplicate charge.', 'PUBLIC'),
(1, 1, 'Thank you. Please let me know when it is resolved.', 'PUBLIC'),

-- Ticket 1: Internal discussion
(1, 2, 'Check the payment gateway logs for duplicate transactions.', 'INTERNAL_NOTE'),
(1, 3, 'One transaction appears to be a duplicate. Verify before issuing a refund.', 'INTERNAL_NOTE'),

-- Ticket 2: Technical issue
(2, 1, 'I cannot log in to my account.', 'PUBLIC'),
(2, 2, 'Please try resetting your password and let us know if the issue persists.', 'PUBLIC'),
(2, 1, 'Password reset worked. I can log in now.', 'PUBLIC'),

-- Ticket 2: Internal note
(2, 2, 'Login issue resolved after password reset.', 'INTERNAL_NOTE');