package controllers

import (
	"backend/database"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetFullSubmissionData(c *gin.Context) {
	var researchers []models.ResearcherData

	err := database.DB.Preload("Responses.UploadedFiles").Preload("Responses").Order("id asc").Find(&researchers).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch submission data"})
		return
	}

	c.JSON(http.StatusOK, researchers)
}
