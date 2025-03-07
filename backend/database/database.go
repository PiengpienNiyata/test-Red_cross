package database

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() error {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Warning: No .env file found or failed to load")
	}

	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	fmt.Println("🔌 Connecting to database with:")
	fmt.Println("   - Host:", dbHost)
	fmt.Println("   - User:", dbUser)
	fmt.Println("   - DB Name:", dbName)
	fmt.Println("   - Port:", dbPort)

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Singapore",
		dbHost, dbUser, dbPass, dbName, dbPort)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // Log queries for debugging
	})

	if err != nil {
		log.Println("❌ Database connection failed:", err)
		return err
	}

	DB = db
	log.Println("✅ Database connected successfully!")

	sqlDB, err := DB.DB()
	if err != nil {
		log.Println("❌ Failed to get database instance:", err)
		return err
	}
	err = sqlDB.Ping()
	if err != nil {
		log.Println("❌ Database ping failed:", err)
		return err
	}
	log.Println("✅ Database ping successful!")

	return nil
}
