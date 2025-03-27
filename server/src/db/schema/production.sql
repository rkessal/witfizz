INSERT INTO users(name, email, password, avatar, lat, lng, role)
VALUES
  ('Johnny', 'johnny@example.com', '$2b$10$YourHashedPasswordHere', 'https://i.imgur.com/31MtvRN.png', 115.4378133,-8.5435824, 'teacher'),
  ('Justin', 'justin@example.com','$2b$10$YourHashedPasswordHere', 'https://i.imgur.com/31MtvRN.png', 120, 49, 'student'),
  ('Rayhan', 'admin@example.com', '$2b$10$kTfIFnjo4omeHKWTyUhyeuFInrcxL1oeZbB3qMEl3S3f5DSdbz89W', 'https://i.imgur.com/31MtvRN.png', 120, 49, 'admin');

INSERT INTO projects (creator_id, name, description, start_date, end_date, background_img)
VALUES
  (null, 'Workland Walkthrough', 'A project to get new users acquainted with Workland!', null, null, ''),
  (1, 'Continued education', 'This purpose of this project is to allocate time blocks for everyone to advance their learning and keep their knowledge up to date', '2022-01-02', '2022-02-01', '');
