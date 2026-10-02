CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role VARCHAR(20) NOT NULL
                           CHECK (role IN ('CUSTOMER', 'AGENT', 'ADMIN')),
                       active BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tickets (
                         id BIGSERIAL PRIMARY KEY,
                         subject VARCHAR(255) NOT NULL,
                         description TEXT NOT NULL,
                         category_id BIGINT NOT NULL,
                         priority VARCHAR(20) NOT NULL
                             CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
                         status VARCHAR(30) NOT NULL
                             CHECK (
                                 status IN (
                                            'OPEN',
                                            'ASSIGNED',
                                            'IN_PROGRESS',
                                            'WAITING_FOR_CUSTOMER',
                                            'RESOLVED',
                                            'CLOSED'
                                     )
                                 ),
                         created_by BIGINT NOT NULL,
                         assigned_to BIGINT,
                         created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         resolved_at TIMESTAMPTZ,
                         closed_at TIMESTAMPTZ,
                         sla_warn_at TIMESTAMPTZ,
                         sla_due_at TIMESTAMPTZ,
                         sla_state VARCHAR(20) NOT NULL DEFAULT 'ON_TRACK'
                             CHECK (
                                 sla_state IN (
                                               'ON_TRACK',
                                               'WARNED',
                                               'BREACHED',
                                               'MET'
                                     )
                                 ),
                         version BIGINT NOT NULL DEFAULT 0,

                         CONSTRAINT fk_ticket_category
                             FOREIGN KEY (category_id) REFERENCES categories(id),

                         CONSTRAINT fk_ticket_created_by
                             FOREIGN KEY (created_by) REFERENCES users(id),

                         CONSTRAINT fk_ticket_assigned_to
                             FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE ticket_messages (
                                 id BIGSERIAL PRIMARY KEY,
                                 ticket_id BIGINT NOT NULL,
                                 sender_id BIGINT NOT NULL,
                                 body TEXT NOT NULL,
                                 type VARCHAR(20) NOT NULL
                                     CHECK (type IN ('PUBLIC', 'INTERNAL_NOTE')),
                                 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                 CONSTRAINT fk_message_ticket
                                     FOREIGN KEY (ticket_id) REFERENCES tickets(id),

                                 CONSTRAINT fk_message_sender
                                     FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE sla_rules (
                           id BIGSERIAL PRIMARY KEY,
                           priority VARCHAR(20) NOT NULL UNIQUE
                               CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
                           resolution_minutes INTEGER NOT NULL,
                           warning_percent INTEGER NOT NULL DEFAULT 80
);

CREATE TABLE audit_logs (
                            id BIGSERIAL PRIMARY KEY,
                            ticket_id BIGINT,
                            actor_id BIGINT,
                            action VARCHAR(100) NOT NULL,
                            field_name VARCHAR(100),
                            old_value TEXT,
                            new_value TEXT,
                            event_id UUID NOT NULL,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            CONSTRAINT fk_audit_ticket
                                FOREIGN KEY (ticket_id) REFERENCES tickets(id),

                            CONSTRAINT fk_audit_actor
                                FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE TABLE notifications (
                               id BIGSERIAL PRIMARY KEY,
                               user_id BIGINT NOT NULL,
                               type VARCHAR(50) NOT NULL,
                               ticket_id BIGINT,
                               message TEXT NOT NULL,
                               is_read BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                               CONSTRAINT fk_notification_user
                                   FOREIGN KEY (user_id) REFERENCES users(id),

                               CONSTRAINT fk_notification_ticket
                                   FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

CREATE TABLE processed_events (
                                  event_id UUID NOT NULL,
                                  consumer_name VARCHAR(100) NOT NULL,
                                  processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                  PRIMARY KEY (event_id, consumer_name)
);


-- Indexes required by the project design

CREATE INDEX idx_tickets_status_priority
    ON tickets(status, priority);

CREATE INDEX idx_tickets_assigned_status
    ON tickets(assigned_to, status);

CREATE INDEX idx_tickets_created_by
    ON tickets(created_by);

CREATE INDEX idx_tickets_sla_due_active
    ON tickets(sla_due_at)
    WHERE status NOT IN ('RESOLVED', 'CLOSED');

CREATE INDEX idx_ticket_messages_ticket_created
    ON ticket_messages(ticket_id, created_at);

CREATE INDEX idx_notifications_user_read_created
    ON notifications(user_id, is_read, created_at);

CREATE INDEX idx_audit_logs_ticket_created
    ON audit_logs(ticket_id, created_at);


-- Required category seed data

INSERT INTO categories (name)
VALUES
    ('Payment'),
    ('Technical'),
    ('Account'),
    ('General');


-- Required SLA seed data

INSERT INTO sla_rules (priority, resolution_minutes, warning_percent)
VALUES
    ('CRITICAL', 60, 80),
    ('HIGH', 240, 80),
    ('MEDIUM', 1440, 80),
    ('LOW', 4320, 80);