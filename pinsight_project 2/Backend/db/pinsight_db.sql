-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 06, 2025 at 10:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pinsight_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `otp_verifications`
--

CREATE TABLE `otp_verifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posttest_results`
--

CREATE TABLE `posttest_results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `attempt_number` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_answer` enum('a','b','c','d') NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posttest_results`
--

INSERT INTO `posttest_results` (`id`, `user_id`, `attempt_number`, `question_id`, `selected_answer`, `is_correct`, `submitted_at`) VALUES
(50, 2, 1, 3, 'c', 0, '2025-12-04 17:41:31'),
(51, 2, 1, 7, 'b', 1, '2025-12-04 17:41:31'),
(52, 2, 1, 5, 'b', 1, '2025-12-04 17:41:31'),
(53, 2, 1, 6, 'b', 0, '2025-12-04 17:41:31'),
(54, 2, 1, 4, 'b', 1, '2025-12-04 17:41:31'),
(55, 2, 1, 2, 'd', 0, '2025-12-04 17:41:31'),
(56, 2, 1, 9, 'd', 0, '2025-12-04 17:41:31'),
(57, 2, 1, 10, 'd', 0, '2025-12-04 17:41:31'),
(58, 2, 1, 8, 'b', 1, '2025-12-04 17:41:31'),
(59, 4, 1, 10, 'c', 0, '2025-12-04 18:08:21'),
(60, 4, 1, 5, 'd', 0, '2025-12-04 18:08:21'),
(61, 4, 1, 4, 'd', 0, '2025-12-04 18:08:21'),
(62, 4, 1, 6, 'd', 0, '2025-12-04 18:08:21'),
(63, 4, 1, 8, 'a', 0, '2025-12-04 18:08:21'),
(64, 4, 1, 9, 'b', 1, '2025-12-04 18:08:21'),
(65, 4, 1, 2, 'c', 0, '2025-12-04 18:08:21'),
(66, 4, 1, 3, 'd', 0, '2025-12-04 18:08:21'),
(67, 4, 1, 7, 'd', 0, '2025-12-04 18:08:21');

-- --------------------------------------------------------

--
-- Table structure for table `pretest_results`
--

CREATE TABLE `pretest_results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_answer` enum('a','b','c','d') NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pretest_results`
--

INSERT INTO `pretest_results` (`id`, `user_id`, `question_id`, `selected_answer`, `is_correct`, `submitted_at`) VALUES
(28, 2, 8, 'a', 0, '2025-12-04 16:17:14'),
(29, 2, 5, 'b', 1, '2025-12-04 16:17:14'),
(30, 2, 7, 'b', 1, '2025-12-04 16:17:14'),
(31, 2, 3, 'b', 1, '2025-12-04 16:17:14'),
(32, 2, 4, 'c', 0, '2025-12-04 16:17:14'),
(33, 2, 2, 'b', 1, '2025-12-04 16:17:14'),
(34, 2, 9, 'b', 1, '2025-12-04 16:17:14'),
(35, 2, 10, 'b', 1, '2025-12-04 16:17:14'),
(36, 2, 6, 'b', 0, '2025-12-04 16:17:14'),
(38, 4, 3, 'c', 0, '2025-12-04 17:45:59'),
(39, 4, 9, 'b', 1, '2025-12-04 17:45:59'),
(40, 4, 4, 'd', 0, '2025-12-04 17:45:59'),
(41, 4, 2, 'b', 1, '2025-12-04 17:45:59'),
(42, 4, 10, 'd', 0, '2025-12-04 17:45:59'),
(43, 4, 7, 'd', 0, '2025-12-04 17:45:59'),
(44, 4, 6, 'd', 0, '2025-12-04 17:45:59'),
(45, 4, 5, 'd', 0, '2025-12-04 17:45:59'),
(47, 4, 8, 'd', 0, '2025-12-04 17:45:59');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `option_a` varchar(255) NOT NULL,
  `option_b` varchar(255) NOT NULL,
  `option_c` varchar(255) NOT NULL,
  `option_d` varchar(255) NOT NULL,
  `correct_answer` enum('a','b','c','d') NOT NULL,
  `question_type` enum('pretest','posttest','both') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `question_type`, `created_at`, `updated_at`) VALUES
(2, 'To help students understand mood swings in bipolar disorder, the most engaging approach is to:', ' Show graphs of mood charts only', 'Facilitate a small-group discussion with case histories illustrating manic and depressive episodes', ' Assign textbook reading without guidance', ' Present long monologues about pharmacology', 'b', 'both', '2025-12-03 06:49:41', '2025-12-04 17:57:07'),
(3, 'When explaining compulsive rituals in OCD, the most student-centered method is:', 'Lecture with bullet points on types of rituals', 'Demonstration of a common compulsive behavior and followed by peer teaching', 'Handing out diagnostic criteria only', 'Assigning a research article for independent study', 'b', 'both', '2025-12-03 06:49:41', '2025-12-04 17:58:28'),
(4, 'To teach about craving and relapse in substance use disorders, the best educational tool is:', 'Abstract conceptual slides', 'A patient case study followed by role-play of counseling strategies', 'Reading DSM-5 definitions silently', 'A multiple-choice quiz alone', 'b', 'both', '2025-12-03 06:49:41', '2025-12-04 17:59:04'),
(5, 'For teaching schizophrenia, a high-impact formative assessment method would be:', 'Final written exam only', ' Mini Clinical Evaluation Exercise (mini-CEX) on mental status examination', 'Group essay assignment only', 'Oral quiz with yes/no answers', 'b', 'both', '2025-12-03 06:49:41', '2025-12-04 18:00:54'),
(6, 'To ensure undergraduate students grasp the difference between mania and hypomania, a suitable teaching approach is:', 'Use of structured OSCE stations simulating mood assessment', ' Long handwritten notes from lecturer', 'Define in DSM-5 language only', 'Passive listening to recorded lectures', 'a', 'both', '2025-12-03 06:49:41', '2025-12-04 18:01:04'),
(7, 'When conveying rationales for exposure and response prevention in OCD, the best teaching method is:', 'Chalk-and-talk lecture', ' Problem-based learning with real-life scenarios demonstrating ERP steps', ' Reading off the PowerPoint slides', 'Assign multiple articles without discussion', 'b', 'both', '2025-12-03 06:49:41', '2025-12-04 18:01:18'),
(8, 'To foster undergraduate understanding of dual diagnosis in substance use (comorbidity with mental disorders), the most interactive method is:', ' Large-group lecture with statistics', ' Case-based discussion facilitated by the resident', ' Giving them a chart to memorize', ' Asking them to compile bibliographies', 'b', 'both', '2025-12-03 06:49:41', '2025-12-04 18:01:33'),
(9, 'If you want to assess how well a student can teach psychotic symptoms in schizophrenia, the most direct assessment format would be:', ' Ask them to summarize a textbook chapter', ' Observe them teaching a peer in a microteaching session', 'Written multiple-choice test only', ' Passive listening during your class', 'b', 'both', '2025-12-03 06:49:41', '2025-12-04 18:01:51'),
(10, 'To help students identify descriptions of OCD vs. compulsive behavior in other disorders, which method is most effective?', ' Lecture on definitions only', 'Provide samples and conduct a small-group sorting activity', ' Assigning a one-minute oral summary', ' Rely solely on diagnostic manuals', 'b', 'both', '2025-12-03 06:49:41', '2025-12-04 18:02:02');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@pinsight.com', '$2y$10$IhjAa8.xMpaMD.fIaIyuPer1jqjsan3KloO05G9KCps83wmc/81UO', 'admin', '2025-12-02 10:16:45', '2025-12-03 10:04:19'),
(2, 'Test User', 'testuser@example.com', '$2y$10$bzkqxLA6ZkVI8.V5JZZoo.eKib3UNA0bEhOsOjeqgqXaTOX10.rWS', 'user', '2025-12-02 10:28:05', '2025-12-03 10:02:53'),
(3, 'cherladhan', 'cher@mail.com', '$2y$10$7n6uzR4bf6wrz8nGzBvhwuG5STlqTzX.cv9.JRGnEOvt/3f3AID/K', 'user', '2025-12-02 14:49:01', '2025-12-02 14:49:01'),
(4, 'renu', 'renuka0708@gmail.com', '$2y$10$DIst/IXvNBOxdAUjmovKJ.43rQ3s1Q7cNKsnuSyNBG/jDxbHIudbC', 'user', '2025-12-04 17:45:10', '2025-12-04 17:45:10');

-- --------------------------------------------------------

--
-- Table structure for table `user_progress`
--

CREATE TABLE `user_progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pretest_done` tinyint(1) DEFAULT 0,
  `pretest_score` int(11) DEFAULT 0,
  `pretest_total` int(11) DEFAULT 0,
  `video_done` tinyint(1) DEFAULT 0,
  `posttest_attempts` int(11) DEFAULT 0,
  `best_posttest_score` int(11) DEFAULT 0,
  `best_posttest_total` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_progress`
--

INSERT INTO `user_progress` (`id`, `user_id`, `pretest_done`, `pretest_score`, `pretest_total`, `video_done`, `posttest_attempts`, `best_posttest_score`, `best_posttest_total`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 6, 10, 1, 1, 4, 9, '2025-12-02 10:28:05', '2025-12-04 17:41:31'),
(2, 3, 0, 0, 0, 0, 0, 0, 0, '2025-12-02 14:49:01', '2025-12-03 06:52:38'),
(3, 4, 1, 2, 10, 1, 1, 1, 9, '2025-12-04 17:45:10', '2025-12-04 18:08:21');

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `video_url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL COMMENT 'Duration in seconds',
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` (`id`, `title`, `description`, `video_url`, `thumbnail_url`, `duration`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 'Introduction to Learning', 'Welcome to the course', '/uploads/videos/VIDEO-2025-08-31-12-56-08.mp4', 'https://example.com/thumb1.jpg', 100, 1, '2025-12-02 10:16:46', '2025-12-03 12:51:55'),
(2, 'Core Concepts', 'Understanding the basics', '/uploads/videos/VIDEO-2025-08-31-12-56-08.mp4', 'https://example.com/thumb2.jpg', 100, 2, '2025-12-02 10:16:46', '2025-12-03 13:06:35');

-- --------------------------------------------------------

--
-- Table structure for table `video_progress`
--

CREATE TABLE `video_progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `last_position` int(11) DEFAULT 0 COMMENT 'Last watched position in seconds',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `video_progress`
--

INSERT INTO `video_progress` (`id`, `user_id`, `video_id`, `is_completed`, `last_position`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, 0, '2025-12-04 17:40:37', '2025-12-03 07:39:54', '2025-12-04 17:40:37'),
(2, 2, 2, 1, 0, '2025-12-04 17:40:37', '2025-12-03 07:39:54', '2025-12-04 17:40:37'),
(83, 4, 1, 1, 0, '2025-12-04 17:46:20', '2025-12-04 17:46:20', '2025-12-04 17:46:20'),
(84, 4, 2, 1, 0, '2025-12-04 17:46:20', '2025-12-04 17:46:20', '2025-12-04 17:46:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_email_otp` (`email`,`otp`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `posttest_results`
--
ALTER TABLE `posttest_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `idx_user_attempt` (`user_id`,`attempt_number`);

--
-- Indexes for table `pretest_results`
--
ALTER TABLE `pretest_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_progress`
--
ALTER TABLE `user_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_progress` (`user_id`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `video_progress`
--
ALTER TABLE `video_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_video` (`user_id`,`video_id`),
  ADD KEY `video_id` (`video_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `posttest_results`
--
ALTER TABLE `posttest_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `pretest_results`
--
ALTER TABLE `pretest_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_progress`
--
ALTER TABLE `user_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `video_progress`
--
ALTER TABLE `video_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD CONSTRAINT `otp_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posttest_results`
--
ALTER TABLE `posttest_results`
  ADD CONSTRAINT `posttest_results_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `posttest_results_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pretest_results`
--
ALTER TABLE `pretest_results`
  ADD CONSTRAINT `pretest_results_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pretest_results_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_progress`
--
ALTER TABLE `user_progress`
  ADD CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `video_progress`
--
ALTER TABLE `video_progress`
  ADD CONSTRAINT `video_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `video_progress_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
