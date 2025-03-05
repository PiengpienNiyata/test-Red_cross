package main

import (
	"backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default() // Initialize router

	routes.SetupRoutes(r) // Load API routes

	r.Run(":8080") // Start server on port 8080
}
