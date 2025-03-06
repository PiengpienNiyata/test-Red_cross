package controllers

import (
	"backend/database"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetQuestions(c *gin.Context) {
	var questions []models.Question
	if err := database.DB.Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, questions)
}

func GetQuestionsBySection(c *gin.Context) {
	sectionID := c.Param("section_id") // Get section_id from URL
	var questions []models.Question

	if err := database.DB.Where("section_id = ?", sectionID).Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, questions)
}
