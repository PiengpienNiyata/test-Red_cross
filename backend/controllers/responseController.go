package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"backend/database"
	"backend/models"

	"backend/services"

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
		ResearcherName       string                 `json:"researcher_name"`
		ResearcherEmail      string                 `json:"researcher_email"`
		ExistingFileIDs      []uint                 `json:"existing_file_ids"`
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

	if len(request.ExistingFileIDs) > 0 {
		var originalFiles []models.UploadedFile
		// Find all original files based on the IDs sent from the frontend
		database.DB.Where("id IN ?", request.ExistingFileIDs).Find(&originalFiles)

		for _, originalFile := range originalFiles {
			newFileCopy := models.UploadedFile{
				ResponseID: response.ID, // Link to the NEW response ID
				QuestionID: originalFile.QuestionID,
				FileName:   originalFile.FileName,
				MimeType:   originalFile.MimeType,
				FileData:   originalFile.FileData, // Copy the binary data
			}
			// Create a new record for the copied file
			database.DB.Create(&newFileCopy)
		}
	}

	// go services.SendSubmissionNotification(
	// 	request.ResearcherName,
	// 	"jirawansong99@gmail.com", // Using your test email for now
	// 	response.DiseaseName,      // Using disease name as project name
	// 	response.Token,
	// 	response.Version,
	// )

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
		"researcher_data":       researcher,      // Attach the researcher data here
		"remark":                response.Remark, // <-- ADD THIS LINE

	}

	c.JSON(http.StatusOK, combinedResult)
}

// Add this new function to responseController.go
func FinalizeSubmission(c *gin.Context) {
	responseID := c.Param("id")
	var response models.Response
	var researcher models.ResearcherData

	// Find the response record
	if err := database.DB.First(&response, responseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Response not found"})
		return
	}

	// Find the associated researcher to get their name and email
	if err := database.DB.First(&researcher, response.ResearcherID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Associated researcher not found"})
		return
	}

	// Send the notification emails in the background
	go services.SendSubmissionNotification(
		researcher.Name,
		//"jirawansong99@gmail.com", // Using your test email for now
		researcher.Email,
		researcher.ProjectName,
		response.Token,
		response.Version,
	)

	c.JSON(http.StatusOK, gin.H{"message": "Submission finalized and notifications sent."})
}

// --- ADD THIS ENTIRE NEW FUNCTION ---
func UpdateSubmissionStatus(c *gin.Context) {
	var request struct {
		Token  string `json:"token"`
		Status int    `json:"status"`
		Remark string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Find the latest response for the given token to get its ID
	var latestResponse models.Response
	if err := database.DB.Where("token = ?", request.Token).Order("version desc").First(&latestResponse).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission not found"})
		return
	}

	// Update the status and remark for that specific response ID
	if err := database.DB.Model(&models.Response{}).Where("id = ?", latestResponse.ID).Updates(map[string]interface{}{"status": request.Status, "remark": request.Remark}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	// After updating, fetch the researcher's info for the email notification
	var researcher models.ResearcherData
	if err := database.DB.First(&researcher, latestResponse.ResearcherID).Error; err != nil {
		// Even if this fails, the status was updated, so we don't return an error to the client
		// but we log it on the server.
		fmt.Println("Could not find researcher for email notification:", err)
	} else {
		// --- THIS IS THE NEW CONDITIONAL LOGIC ---
		// If the status is -1 (Canceled), notify the admin.
		// Otherwise, notify the researcher about the status update.
		if request.Status == -1 {
			go services.SendCancellationNotificationToAdmin(
				researcher.Name,
				researcher.ProjectName, // Use ProjectName for consistency in cancellation notices
				latestResponse.Token,
			)
		} else {
			go services.SendStatusUpdateEmail(
				researcher.Name,
				researcher.Email,
				researcher.ProjectName, // Use ProjectName for consistency in cancellation notices
				request.Status,
				request.Remark,
				latestResponse.Token,
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission status updated successfully"})
}

// --- ADD THIS ENTIRE NEW FUNCTION ---

func GetResponseByTokenAndVersion(c *gin.Context) {
	token := c.Param("token")
	version := c.Param("version")
	var response models.Response

	// Find the specific version for the given token
	err := database.DB.
		Preload("UploadedFiles").
		Where("token = ? AND version = ?", token, version).
		First(&response).Error

	if err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Specific response version not found"})
		return
	}

	// Now, get the associated researcher data
	var researcher models.ResearcherData
	if err := database.DB.First(&researcher, response.ResearcherID).Error; err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Associated researcher not found"})
		return
	}

	// Combine them into the same structure as GetLatestResponseByToken
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
		"remark":                response.Remark,
		"uploaded_files":        response.UploadedFiles,
		"researcher_data":       researcher,
	}

	c.JSON(http.StatusOK, combinedResult)
}

// ADD THIS NEW FUNCTION for the researcher's cancel action

func CancelSubmission(c *gin.Context) {
	var request struct {
		Token  string `json:"token"`
		Status int    `json:"status"` // Should be -1
		Remark string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// We only allow this endpoint to set the status to -1 (Canceled)
	if request.Status != -1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This endpoint can only be used to cancel a submission."})
		return
	}

	var latestResponse models.Response
	if err := database.DB.Where("token = ?", request.Token).Order("version desc").First(&latestResponse).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission not found"})
		return
	}

	if err := database.DB.Model(&models.Response{}).Where("id = ?", latestResponse.ID).Update("status", request.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel submission"})
		return
	}

	// We can still notify the admin that a project was canceled
	var researcher models.ResearcherData
	if err := database.DB.First(&researcher, latestResponse.ResearcherID).Error; err == nil {
		go services.SendCancellationNotificationToAdmin(
			researcher.Name,
			researcher.ProjectName,
			latestResponse.Token,
		)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission canceled successfully"})
}
