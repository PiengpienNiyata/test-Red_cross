package main

import (
	"backend/database"
	"backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to Database
	database.ConnectDatabase()

	// Initialize Router
	router := gin.Default()
	routes.SetupRoutes(router)

	// Start Server
	router.Run(":8080")
}
