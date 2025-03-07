package controllers

import (
	"backend/database"
	"backend/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetQuestions(c *gin.Context) {
	var questions []models.Question

	if database.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection is nil"})
		return
	}

	result := database.DB.Find(&questions)

	if result.Error != nil {
		fmt.Println("❌ Query Error:", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No questions found in database"})
		return
	}

	c.JSON(http.StatusOK, questions)
}

func GetQuestionsBySection(c *gin.Context) {
	sectionID := c.Param("section_id")
	var questions []models.Question

	if err := database.DB.Where("section_id = ?", sectionID).Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, questions)
}
