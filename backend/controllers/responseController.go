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
		ResearcherID         uint                   `json:"researcher_id"`
		QuestionnaireID      uint                   `json:"questionnaire_id"`
		Answers              map[string]interface{} `json:"answers"`
		FinalRoute           string                 `json:"final_route"`
		DiseaseName          string                 `json:"disease_name"`
		Intervention         string                 `json:"intervention"`
		ResearchContext      map[string]interface{} `json:"research_context"`
		ConfidentialityLevel string                 `json:"confidentiality_level"`
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

	researchContextJSON, err := json.Marshal(request.ResearchContext)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode research context"})
		return
	}

	response := models.Response{
		ResearcherID:         request.ResearcherID,
		QuestionnaireID:      request.QuestionnaireID,
		Answers:              answersJSON,
		ResearchContext:      researchContextJSON,
		Survey:               nil,
		FinalRoute:           request.FinalRoute,
		SubmittedAt:          time.Now(),
		DiseaseName:          request.DiseaseName,
		Intervention:         request.Intervention,
		ConfidentialityLevel: request.ConfidentialityLevel,
	}

	if err := database.DB.Create(&response).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save response", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Response saved",
		"id":          response.ID,
		"final_route": response.FinalRoute,
	})
}
