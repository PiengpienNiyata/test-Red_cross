package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"backend/database"
	"backend/models"

	"github.com/gin-gonic/gin"
)

// import (
// 	"encoding/json"
// 	"net/http"
// 	"time"

// 	"backend/database"
// 	"backend/models"

// 	"github.com/gin-gonic/gin"
// )

// --- ADD THIS HELPER FUNCTION ---
// This function generates a secure, random token string.
func generateRandomToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// --- THIS FUNCTION IS UPDATED ---
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
		Token                *string                `json:"token"`
		Version              *int                   `json:"version"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	answersJSON, err := json.Marshal(request.Answers)
	if err != nil { /* ... handle error ... */
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid answersJSON"})
		return
	}

	researchContextJSON, err := json.Marshal(request.ResearchContext)
	if err != nil { /* ... handle error ... */
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid researchContextJSON"})
		return
	}
	var responseToken string
	var responseVersion int

	// token, err := generateRandomToken(16) // Creates a 32-character token
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate submission token"})
	// 	return
	// }
	if request.Token != nil && *request.Token != "" {
		// This is a re-submission (an edit)
		responseToken = *request.Token
		responseVersion = *request.Version + 1
	} else {
		// This is a brand new submission
		newToken, err := generateRandomToken(16)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate submission token"})
			return
		}
		responseToken = newToken
		responseVersion = 1
	}

	// --- NEW: Generate a unique token for this new submission thread ---

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

		// --- NEW: Set the initial values for a new submission ---
		Status:  0, // Always reset status to 'submitted'
		Version: responseVersion,
		Token:   responseToken,
	}

	if err := database.DB.Create(&response).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save response", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Response saved",
		"id":          response.ID,
		"token":       response.Token, // Return the token to the frontend
		"final_route": response.FinalRoute,
	})
}

// func GetLatestResponseByToken(c *gin.Context) {
// 	token := c.Param("token")
// 	var response models.Response

// 	// This query preloads all the related data. If there's a mismatch
// 	// between models and the DB, the error will happen here.
// 	err := database.DB.
// 		Preload("ResearcherData").
// 		Preload("UploadedFiles").
// 		Where("token = ?", token).
// 		Order("version desc").
// 		First(&response).Error

// 	if err != nil {
// 		// Log the actual database error to the backend terminal for debugging
// 		c.Error(err)
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Response not found or database error"})
// 		return
// 	}

//		c.JSON(http.StatusOK, response)
//	}
func GetLatestResponseByToken(c *gin.Context) {
	token := c.Param("token")
	var response models.Response

	// Step 1: Find the response first, but only preload the files.
	err := database.DB.
		Preload("UploadedFiles").
		Where("token = ?", token).
		Order("version desc").
		First(&response).Error

	if err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Response not found"})
		return
	}

	// Step 2: Now, explicitly find the associated researcher data.
	var researcher models.ResearcherData
	if err := database.DB.First(&researcher, response.ResearcherID).Error; err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Associated researcher not found"})
		return
	}

	// Step 3: Combine them into a new structure to send to the frontend.
	// This ensures the frontend gets the exact JSON structure it expects.
	combinedResult := gin.H{
		"id":                    response.ID,
		"researcher_id":         response.ResearcherID,
		"questionnaire_id":      response.QuestionnaireID,
		"answers":               response.Answers,
		"research_context":      response.ResearchContext,
		"survey":                response.Survey,
		"final_route":           response.FinalRoute,
		"submitted_at":          response.SubmittedAt,
		"disease_name":          response.DiseaseName,
		"intervention":          response.Intervention,
		"confidentiality_level": response.ConfidentialityLevel,
		"status":                response.Status,
		"version":               response.Version,
		"token":                 response.Token,
		"uploaded_files":        response.UploadedFiles,
		"researcher_data":       researcher, // Attach the researcher data here
	}

	c.JSON(http.StatusOK, combinedResult)
}
