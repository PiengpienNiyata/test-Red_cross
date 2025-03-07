package controllers

import (
	"backend/database"
	"backend/models"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetSections(c *gin.Context) {
	var sections []models.Section

	if database.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection is nil"})
		return
	}

	result := database.DB.Find(&sections)

	if result.Error != nil {
		fmt.Println("❌ Query Error:", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No sections found in database"})
		return
	}

	c.JSON(http.StatusOK, sections)
}

func GetSectionByQuestionnaireID(c *gin.Context) {
	// Get the questionnaire_id from the URL and convert to integer
	questionnaireID, err := strconv.Atoi(c.Param("questionnaire_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid questionnaire ID"})
		return
	}

	// Query sections based on questionnaire_id
	var sections []models.Section
	if err := database.DB.Where("questionnaire_id = ?", questionnaireID).Find(&sections).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return sections as JSON response
	c.JSON(http.StatusOK, sections)
}
