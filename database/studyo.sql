-- 1. Tabel Users (Mendukung Admin, Teacher, Student + status pending & approved_at)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student', -- 'admin', 'teacher', 'student'
    teacher_status VARCHAR(20) DEFAULT NULL,     -- NULL, 'pending', 'approved'
    approved_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Categories (Untuk Category Management & dropdown course)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Tabel Courses (Rentang waktu start_date & end_date nullable untuk lifetime access)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Contents / Materi Pembelajaran (Wajib ada course_id & order_index)
CREATE TABLE contents (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Enrollments (Pendaftaran student ke course)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- 6. Tabel Content Progress (Menandai materi selesai / "Mark as Done")
CREATE TABLE content_progress (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, content_id)
);

-- 7. Tabel Discussions (Forum diskusi / komentar di bawah tiap materi)
CREATE TABLE discussions (
    id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabel Certificates (Optional Upgrade: Certificate Issuance saat progress 100%)
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DATA AWAL (SEEDING) UNTUK PENGUJIAN
-- ==========================================
INSERT INTO users (username, email, password, role, teacher_status, approved_at) VALUES
('Admin Studyo', 'admin@studyo.com', 'admin123', 'admin', NULL, NULL),
('Budi Santoso', 'budi@studyo.com', 'teacher123', 'teacher', 'approved', NOW() - INTERVAL '2 days'),
('Siti Rahma', 'siti@studyo.com', 'student123', 'student', 'pending', NULL),
('Andi Pratama', 'andi@studyo.com', 'student123', 'student', NULL, NULL);

INSERT INTO categories (name) VALUES
('Web Development'),
('Data Science'),
('UI/UX Design'),
('Teknologi');

INSERT INTO courses (title, description, category_id, teacher_id, start_date, end_date) VALUES
('Next.js & PostgreSQL Fullstack', 'Membangun aplikasi web modern dari nol menggunakan Next.js App Router dan Raw SQL.', 1, 2, NULL, NULL),
('Dasar Analisis Data dengan SQL', 'Pelajari teknik query, agregasi, dan relasi tabel untuk kebutuhan bisnis.', 2, 2, '2026-11-01', '2026-12-30');

INSERT INTO contents (course_id, title, body, order_index) VALUES
(1, 'Pengenalan App Router Next.js', '<p>Memahami konsep <strong>File-System Routing</strong> dan perbedaan Server vs Client Component.</p>', 1),
(1, 'Koneksi Database dengan node-postgres (pg)', '<p>Menggunakan <em>Pool</em> dan <strong>Parameterized Query ($1, $2)</strong> untuk mencegah SQL Injection.</p>', 2),
(2, 'Seleksi dan Filtering Data', '<p>Penggunaan perintah dasar <code>SELECT</code>, <code>WHERE</code>, dan <code>ORDER BY</code>.</p>', 1);