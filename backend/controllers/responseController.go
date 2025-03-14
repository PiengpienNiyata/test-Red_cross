package controllers

import (
	"encoding/json"
	"net/http"
	"time"

	"backend/database"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func SaveResponse(c *gin.Context) {
	var request struct {
		ResearcherID    uint                   `json:"researcher_id"`
		QuestionnaireID uint                   `json:"questionnaire_id"`
		Answers         map[string]interface{} `json:"answers"`
		Survey          map[string]interface{} `json:"survey"`
		FinalRoute      string                 `json:"final_route"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	answersJSON, err := json.Marshal(request.Answers)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode answers"})
		return
	}

	surveyJSON, err := json.Marshal(request.Survey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode survey"})
		return
	}

	response := models.Response{
		ResearcherID:    request.ResearcherID,
		QuestionnaireID: request.QuestionnaireID,
		Answers:         string(answersJSON),
		Survey:          string(surveyJSON),
		FinalRoute:      request.FinalRoute,
		SubmittedAt:     time.Now(),
	}

	if err := database.DB.Create(&response).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save response"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Response saved",
		"id":          response.ID,
		"final_route": response.FinalRoute,
	})
}
