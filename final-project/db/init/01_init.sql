CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    task_name TEXT NOT NULL,
    task_description TEXT,
    priority text check (priority IN ('low', 'med', 'high')) DEFAULT 'med',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
);

INSERT INTO tasks (task_name, task_description, priority)
VALUES
    ('Task 1', 'Description for Task 1', 'med'),
    ('Task 2', 'Description for Task 2', 'high'),
    ('Task 3', 'Description for Task 3', 'low')
ON CONFLICT (task_name) DO NOTHING;