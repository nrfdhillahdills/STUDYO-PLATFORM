-- ==========================================
-- SKEMA DATABASE STUDYO (PLATFORM KURSUS BAHASA)
-- ==========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    teacher_status VARCHAR(20) DEFAULT NULL,
    approved_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

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

CREATE TABLE contents (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE TABLE content_progress (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, content_id)
);

CREATE TABLE discussions (
    id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DATA AWAL KURSUS BAHASA
-- ==========================================

INSERT INTO users (username, email, password, role, teacher_status, approved_at) VALUES
('Admin Studyo', 'admin@studyo.com', 'admin123', 'admin', NULL, NULL),
('Budi Santoso', 'budi@studyo.com', 'teacher123', 'teacher', 'approved', NOW() - INTERVAL '2 days'),
('Siti Rahma', 'siti@studyo.com', 'student123', 'student', 'pending', NULL),
('Andi Pratama', 'andi@studyo.com', 'student123', 'student', NULL, NULL);

INSERT INTO categories (name) VALUES
('Bahasa Inggris'),
('Bahasa Korea'),
('Bahasa Jepang'),
('Persiapan Tes Bahasa');

INSERT INTO courses (title, description, category_id, teacher_id, start_date, end_date) VALUES
('Bahasa Korea Dasar: Hangul & Percakapan', 'Kuasai cara membaca huruf Hangul, pelafalan alami, serta ungkapan sehari-hari untuk pemula.', 2, 2, NULL, NULL),
('English for Professional & Workplace', 'Tingkatkan kemampuan menulis email bisnis, presentasi, dan komunikasi profesional dalam bahasa Inggris.', 1, 2, NULL, NULL),
('Intensif Persiapan TOEFL ITP', 'Strategi menaklukkan sesi Listening, Structure, dan Reading beserta latihan terstruktur.', 4, 2, '2026-11-01', '2026-12-30'),
('Bahasa Jepang N5: Hiragana, Katakana & Tata Bahasa', 'Langkah awal belajar bahasa Jepang dari pengenalan aksara dasar hingga pola kalimat N5.', 3, 2, NULL, NULL);

INSERT INTO contents (course_id, title, body, order_index) VALUES
(1, 'Mengenal Vokal dan Konsonan Dasar Hangul', '<p>Dalam bahasa Korea, huruf <strong>Hangul</strong> disusun dalam blok suku kata yang terdiri dari konsonan awal, vokal, dan konsonan akhir (<em>batchim</em>).</p>', 1),
(1, 'Salam dan Perkenalan Diri (자기소개)', '<p>Pelajari perbedaan tingkat kesopanan formal (<em>-mnida</em>) dan sopan standar (<em>-yo</em>) saat memperkenalkan diri.</p>', 2),
(2, 'Menulis Email Bisnis yang Efektif', '<p>Struktur pembukaan, inti pesan, dan penutup email profesional agar terdengar sopan dan jelas.</p>', 1),
(3, 'Strategi Dasar Structure & Written Expression', '<p>Mengidentifikasi <strong>Subject-Verb Agreement</strong> dan penggunaan <em>tenses</em> yang sering muncul dalam ujian.</p>', 1);