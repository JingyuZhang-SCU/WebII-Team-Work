-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: charityevents_db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Fun Run'),(2,'Gala Dinner'),(3,'Charity Auction');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `date` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `ticket_price` decimal(10,2) DEFAULT NULL,
  `goal_amount` decimal(10,2) DEFAULT '0.00',
  `current_amount` decimal(10,2) DEFAULT '0.00',
  `category_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Autumn Charity Fun Run 2025','A 5K run to raise funds for children\'s hospital','2025-10-10 09:00:00','City Park',30.00,10000.00,9500.00,1,1),(2,'Winter Glow Run 2025','Glow-in-the-dark night run for a cause','2025-11-15 19:30:00','Seaside Boulevard',35.00,12000.00,2000.00,1,1),(3,'Summer Health Run 2025','Last year\'s community run (completed)','2025-07-01 08:00:00','Forest Trail Park',25.00,8000.00,8200.00,1,1),(4,'Winter Charity Gala 2025','Elegant evening with dinner, auctions, and donations','2025-12-12 18:30:00','Royal Grand Hotel',200.00,50000.00,5000.00,2,1),(5,'Summer Charity Gala 2025','Annual gala celebrating the new year with giving','2025-09-01 20:00:00','Golden Bay Resort',180.00,40000.00,41000.00,2,1),(6,'Art for Hope Auction 2025','Fine art and handmade crafts auction for charity','2025-10-20 14:00:00','City Art Gallery',0.00,30000.00,0.00,3,1),(7,'Vintage Treasures Auction 2025','Antiques and collectibles charity auction (past event)','2025-08-15 15:00:00','Heritage Museum',50.00,25000.00,26000.00,3,1),(8,'Digital Art NFT Charity Auction 2025','Online auction of NFTs and digital artworks','2025-11-30 20:00:00','Online Platform',0.00,20000.00,3000.00,3,1);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `tickets_count` int DEFAULT '1',
  `registration_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`event_id`,`email`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (1,1,'John Smith','john@email.com','0412345678',2,'2025-10-01 10:00:00',60.00),(2,1,'Sarah Johnson','sarah@email.com','0423456789',1,'2025-10-02 14:30:00',30.00),(3,1,'Michael Brown','michael@email.com','0434567890',3,'2025-10-03 09:15:00',90.00),(4,2,'Emma Wilson','emma@email.com','0445678901',2,'2025-10-05 16:20:00',70.00),(5,2,'Oliver Davis','oliver@email.com','0456789012',1,'2025-10-06 11:45:00',35.00),(6,4,'Sophia Miller','sophia@email.com','0467890123',2,'2025-10-08 18:00:00',400.00),(7,5,'Liam Garcia','liam@email.com','0478901234',1,'2025-09-01 20:30:00',180.00),(8,6,'Ava Martinez','ava@email.com','0489012345',1,'2025-10-15 13:00:00',0.00),(9,7,'Noah Rodriguez','noah@email.com','0490123456',2,'2025-08-10 15:30:00',100.00),(10,8,'Isabella Lopez','isabella@email.com','0401234567',1,'2025-11-01 19:00:00',0.00);
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-16 14:30:55
