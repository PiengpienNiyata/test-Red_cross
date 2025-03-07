package main

import (
	"backend/database"
	"backend/routes"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to Database
	if err := database.ConnectDatabase(); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err) // Logs the real error and exits
	}

	// Setup Gin Router
	r := gin.Default()
	routes.SetupRoutes(r)

	// Start server
	log.Println("🚀 Server is running on port 8080...")
	r.Run(":8080") // Start server on port 8080
}
