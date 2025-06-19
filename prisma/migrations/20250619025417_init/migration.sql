-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Airport` (
    `airport_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `iata_code` CHAR(3) NULL,
    `icao_code` CHAR(4) NULL,

    PRIMARY KEY (`airport_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Terminal` (
    `terminal_id` INTEGER NOT NULL AUTO_INCREMENT,
    `airport_id` INTEGER NULL,
    `name` VARCHAR(10) NULL,

    PRIMARY KEY (`terminal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gate` (
    `gate_id` INTEGER NOT NULL AUTO_INCREMENT,
    `terminal_id` INTEGER NULL,
    `gate_number` VARCHAR(10) NULL,

    PRIMARY KEY (`gate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stand` (
    `stand_id` INTEGER NOT NULL,
    `fk_Stand_Airport` INTEGER NULL,
    `stand_number` VARCHAR(10) NULL,

    PRIMARY KEY (`stand_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aircraft_Type` (
    `aircraft_type_id` INTEGER NOT NULL,
    `model` VARCHAR(50) NULL,
    `manufacturer` VARCHAR(50) NULL,
    `seats` INTEGER NULL,
    `max_range_km` INTEGER NULL,

    PRIMARY KEY (`aircraft_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Airline` (
    `airline_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NULL,
    `iata_code` CHAR(2) NULL,
    `country` VARCHAR(50) NULL,

    PRIMARY KEY (`airline_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aircraft` (
    `aircraft_id` INTEGER NOT NULL,
    `aircraft_type_id` INTEGER NULL,
    `tail_number` VARCHAR(10) NULL,
    `airline_id` INTEGER NULL,

    PRIMARY KEY (`aircraft_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flight` (
    `flight_id` INTEGER NOT NULL,
    `aircraft_id` INTEGER NULL,
    `airline_id` INTEGER NULL,
    `gate_id` INTEGER NULL,
    `stand_id` INTEGER NULL,
    `departure_airport_id` INTEGER NULL,
    `arrival_airport_id` INTEGER NULL,
    `scheduled_departure` DATETIME(3) NULL,
    `scheduled_arrival` DATETIME(3) NULL,
    `flight_number` VARCHAR(10) NULL,
    `status` ENUM('Scheduled', 'Delayed', 'Cancelled', 'Completed') NULL,

    PRIMARY KEY (`flight_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flight_Schedule` (
    `schedule_id` INTEGER NOT NULL,
    `flight_id` INTEGER NULL,
    `day_of_week` ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun') NULL,
    `departure_time` DATETIME(3) NULL,
    `arrival_time` DATETIME(3) NULL,

    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Passenger` (
    `passenger_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NULL,
    `passport_number` VARCHAR(20) NULL,
    `nationality` VARCHAR(50) NULL,
    `birth_date` DATETIME(3) NULL,

    PRIMARY KEY (`passenger_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `ticket_id` INTEGER NOT NULL,
    `passenger_id` INTEGER NULL,
    `flight_id` INTEGER NULL,
    `seat_number` VARCHAR(5) NULL,
    `ticket_price` DECIMAL(10, 2) NULL,
    `baggage_included` BOOLEAN NULL,

    PRIMARY KEY (`ticket_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Personnel` (
    `personnel_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NULL,
    `position_id` INTEGER NULL,
    `license_number` VARCHAR(50) NULL,
    `hired_date` DATETIME(3) NULL,

    PRIMARY KEY (`personnel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Crew` (
    `crew_id` INTEGER NOT NULL,
    `flight_id` INTEGER NULL,

    PRIMARY KEY (`crew_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Crew_Member` (
    `crew_id` INTEGER NOT NULL,
    `personnel_id` INTEGER NOT NULL,
    `role` VARCHAR(50) NULL,

    PRIMARY KEY (`crew_id`, `personnel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Checkin` (
    `checkin_id` INTEGER NOT NULL,
    `ticket_id` INTEGER NULL,
    `checkin_time` DATETIME(3) NULL,
    `baggage_count` INTEGER NULL,

    PRIMARY KEY (`checkin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Baggage` (
    `baggage_id` INTEGER NOT NULL,
    `checkin_id` INTEGER NULL,
    `weight_kg` DECIMAL(5, 2) NULL,
    `label_number` VARCHAR(20) NULL,

    PRIMARY KEY (`baggage_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Maintenance` (
    `maintenance_id` INTEGER NOT NULL AUTO_INCREMENT,
    `aircraft_id` INTEGER NULL,
    `personnel_id` INTEGER NULL,
    `start_time` DATETIME(3) NULL,
    `end_time` DATETIME(3) NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`maintenance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Maintenance_Log` (
    `log_id` INTEGER NOT NULL,
    `maintenance_id` INTEGER NULL,
    `action` TEXT NULL,
    `timestamp` DATETIME(3) NULL,

    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Incident` (
    `incident_id` INTEGER NOT NULL AUTO_INCREMENT,
    `flight_id` INTEGER NULL,
    `personnel_id` INTEGER NULL,
    `incident_time` DATETIME(3) NULL,
    `description` TEXT NULL,
    `severity` ENUM('Low', 'Medium', 'High', 'Critical') NULL,

    PRIMARY KEY (`incident_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Terminal` ADD CONSTRAINT `Terminal_airport_id_fkey` FOREIGN KEY (`airport_id`) REFERENCES `Airport`(`airport_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gate` ADD CONSTRAINT `Gate_terminal_id_fkey` FOREIGN KEY (`terminal_id`) REFERENCES `Terminal`(`terminal_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stand` ADD CONSTRAINT `Stand_fk_Stand_Airport_fkey` FOREIGN KEY (`fk_Stand_Airport`) REFERENCES `Airport`(`airport_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aircraft` ADD CONSTRAINT `Aircraft_aircraft_type_id_fkey` FOREIGN KEY (`aircraft_type_id`) REFERENCES `Aircraft_Type`(`aircraft_type_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aircraft` ADD CONSTRAINT `Aircraft_airline_id_fkey` FOREIGN KEY (`airline_id`) REFERENCES `Airline`(`airline_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_aircraft_id_fkey` FOREIGN KEY (`aircraft_id`) REFERENCES `Aircraft`(`aircraft_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_airline_id_fkey` FOREIGN KEY (`airline_id`) REFERENCES `Airline`(`airline_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_gate_id_fkey` FOREIGN KEY (`gate_id`) REFERENCES `Gate`(`gate_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_stand_id_fkey` FOREIGN KEY (`stand_id`) REFERENCES `Stand`(`stand_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_departure_airport_id_fkey` FOREIGN KEY (`departure_airport_id`) REFERENCES `Airport`(`airport_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_arrival_airport_id_fkey` FOREIGN KEY (`arrival_airport_id`) REFERENCES `Airport`(`airport_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight_Schedule` ADD CONSTRAINT `Flight_Schedule_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `Flight`(`flight_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_passenger_id_fkey` FOREIGN KEY (`passenger_id`) REFERENCES `Passenger`(`passenger_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `Flight`(`flight_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Crew` ADD CONSTRAINT `Crew_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `Flight`(`flight_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Crew_Member` ADD CONSTRAINT `Crew_Member_crew_id_fkey` FOREIGN KEY (`crew_id`) REFERENCES `Crew`(`crew_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Crew_Member` ADD CONSTRAINT `Crew_Member_personnel_id_fkey` FOREIGN KEY (`personnel_id`) REFERENCES `Personnel`(`personnel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Checkin` ADD CONSTRAINT `Checkin_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `Ticket`(`ticket_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Baggage` ADD CONSTRAINT `Baggage_checkin_id_fkey` FOREIGN KEY (`checkin_id`) REFERENCES `Checkin`(`checkin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Maintenance` ADD CONSTRAINT `Maintenance_aircraft_id_fkey` FOREIGN KEY (`aircraft_id`) REFERENCES `Aircraft`(`aircraft_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Maintenance` ADD CONSTRAINT `Maintenance_personnel_id_fkey` FOREIGN KEY (`personnel_id`) REFERENCES `Personnel`(`personnel_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Maintenance_Log` ADD CONSTRAINT `Maintenance_Log_maintenance_id_fkey` FOREIGN KEY (`maintenance_id`) REFERENCES `Maintenance`(`maintenance_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incident` ADD CONSTRAINT `Incident_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `Flight`(`flight_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incident` ADD CONSTRAINT `Incident_personnel_id_fkey` FOREIGN KEY (`personnel_id`) REFERENCES `Personnel`(`personnel_id`) ON DELETE SET NULL ON UPDATE CASCADE;
