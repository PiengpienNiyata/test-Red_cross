package main

import (
	"backend/database"
	"backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to Database
	if err := database.ConnectDatabase(); err != nil {
		panic("Failed to connect to database")
	}

	// Setup Gin Router
	r := gin.Default()

	// 🔥 Enable CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8080"}, // Adjust based on frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Setup Routes
	routes.SetupRoutes(r)

	// Start server
	r.Run(":8080")
}
