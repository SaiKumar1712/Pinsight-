-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 30, 2026 at 05:06 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

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
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `email`, `otp`, `expires_at`, `created_at`) VALUES
(17, 'saikumary4149.sse@saveetha.com', '1234', '2026-04-24 08:54:39', '2026-04-24 03:14:40');

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
(352, 82, 1, 2, 'b', 1, '2026-05-26 03:29:26'),
(353, 82, 1, 3, 'c', 0, '2026-05-26 03:29:26'),
(354, 82, 1, 4, 'b', 1, '2026-05-26 03:29:26'),
(355, 82, 1, 5, 'b', 1, '2026-05-26 03:29:26'),
(356, 82, 1, 6, 'a', 1, '2026-05-26 03:29:26'),
(357, 82, 1, 7, 'c', 0, '2026-05-26 03:29:26'),
(358, 82, 1, 8, 'b', 1, '2026-05-26 03:29:26'),
(359, 82, 1, 9, 'c', 0, '2026-05-26 03:29:26'),
(360, 82, 1, 10, 'b', 1, '2026-05-26 03:29:26');

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
(580, 82, 2, 'b', 1, '2026-05-26 03:19:49'),
(581, 82, 3, 'b', 1, '2026-05-26 03:19:49'),
(582, 82, 4, 'b', 1, '2026-05-26 03:19:49'),
(583, 82, 5, 'b', 1, '2026-05-26 03:19:49'),
(584, 82, 6, 'b', 0, '2026-05-26 03:19:49'),
(585, 82, 7, 'd', 0, '2026-05-26 03:19:49'),
(586, 82, 8, 'd', 0, '2026-05-26 03:19:49'),
(587, 82, 9, 'd', 0, '2026-05-26 03:19:49'),
(588, 82, 10, 'd', 0, '2026-05-26 03:19:49');

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
(10, 'To help students identify descriptions of OCD vs. compulsive behavior in other disorders, which method is most effective?', ' Lecture on definitions only', 'Provide samples and conduct a small-group sorting activity', ' Assigning a one-minute oral summary', ' Rely solely on diagnostic manuals', 'b', 'both', '2025-12-03 06:49:41', '2025-12-04 18:02:02'),
(15, 'Hiii', '1', '2', '4', '5', 'b', 'pretest', '2026-06-09 08:18:17', '2026-06-09 08:18:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `password`, `role`, `created_at`, `updated_at`) VALUES
(65, 'Abhi', 'sainandasevith171308@gmail.com', NULL, '$2y$10$Uioki1Ah.KzjBxO9ioT.SeX9mWzfLwoZbwTHZYvbf8MgcG4X68CIW', 'admin', '2026-04-09 10:04:09', '2026-05-26 04:27:00'),
(82, 'Veera', 'veera12@gmail.com', '9698527412', '$2y$10$lpKr2QnnBhhQxGcAUdzdE.ur3CctBpN4KlKlhh1dbhJkrfu8eCqL.', 'user', '2026-05-26 03:02:44', '2026-05-26 03:02:44'),
(84, 'Sathish', 'sathish12@gmail.com', '9638527412', '$2y$10$ivz5pnbtml3aOeN2RFntZu1I9YVEa4Huk2n9xZPBfIj6323J8GCx6', 'user', '2026-06-09 08:23:13', '2026-06-09 08:23:13'),
(85, 'Test Final', 'final@test.com', '9876543210', '$2y$12$37zgICmHtUGbWkfoS282T.x4pib9pcapVHDxruW2ACVvLUL.0Un1.', 'user', '2026-06-09 09:06:38', '2026-06-09 09:06:38');

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
  `pretest_attempts` int(11) DEFAULT 0,
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

INSERT INTO `user_progress` (`id`, `user_id`, `pretest_done`, `pretest_score`, `pretest_total`, `pretest_attempts`, `video_done`, `posttest_attempts`, `best_posttest_score`, `best_posttest_total`, `created_at`, `updated_at`) VALUES
(20, 82, 1, 4, 10, 1, 1, 1, 7, 10, '2026-05-26 03:02:44', '2026-05-26 03:29:26'),
(22, 84, 0, 0, 0, 0, 0, 0, 0, 0, '2026-06-09 08:23:13', '2026-06-09 08:23:13');

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` int(11) NOT NULL,
  `module_id` int(11) DEFAULT 1,
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

INSERT INTO `videos` (`id`, `module_id`, `title`, `description`, `video_url`, `thumbnail_url`, `duration`, `order_index`, `created_at`, `updated_at`) VALUES
(3, 1, 'Core Concepts', 'Understanding the basics', '/uploads/videos/1764431005_VIDEO-2025-08-31-12-56-08.mp4', '/uploads/thumbnails/core.png', 100, 2, '2026-04-27 03:03:02', '2026-04-27 04:34:47');

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
(109, 82, 3, 1, 0, '2026-05-26 03:28:50', '2026-05-26 03:28:50', '2026-05-26 03:28:50');

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
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `posttest_results`
--
ALTER TABLE `posttest_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=362;

--
-- AUTO_INCREMENT for table `pretest_results`
--
ALTER TABLE `pretest_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=600;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `user_progress`
--
ALTER TABLE `user_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `video_progress`
--
ALTER TABLE `video_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

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
