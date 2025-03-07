package controllers

import (
	"backend/database"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SaveResearcher(c *gin.Context) {
	var researcher models.ResearcherData

	if err := c.ShouldBindJSON(&researcher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := database.DB.Create(&researcher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save researcher data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Researcher data saved", "researcher": researcher})
}
