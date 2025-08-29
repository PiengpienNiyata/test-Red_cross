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

func generateRandomToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// func SaveResponse(c *gin.Context) {
// 	var request struct {
// 		ResearcherID         uint                   `json:"researcher_id"`
// 		QuestionnaireID      uint                   `json:"questionnaire_id"`
// 		Answers              map[string]interface{} `json:"answers"`
// 		FinalRoute           string                 `json:"final_route"`
// 		DiseaseName          string                 `json:"disease_name"`
// 		Intervention         string                 `json:"intervention"`
// 		ResearchContext      map[string]interface{} `json:"research_context"`
// 		ConfidentialityLevel string                 `json:"confidentiality_level"`
// 		Token                *string                `json:"token"`
// 		Version              *int                   `json:"version"`
// 		Status               int                    `json:"status"`
// 		ResearcherName       string                 `json:"researcher_name"`
// 		ResearcherEmail      string                 `json:"researcher_email"`
// 		ExistingFileIDs      []uint                 `json:"existing_file_ids"`
// 	}

// 	if err := c.ShouldBindJSON(&request); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
// 		return
// 	}

// 	answersJSON, err := json.Marshal(request.Answers)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid answersJSON"})
// 		return
// 	}

// 	researchContextJSON, err := json.Marshal(request.ResearchContext)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid researchContextJSON"})
// 		return
// 	}
// 	var responseToken string
// 	var responseVersion int
// 	var responseStatus int

// 	// WHY: This is the new logic. We check the status from the request.
// 	if request.Status == -5 {
// 		// THIS IS A DRAFT
// 		responseStatus = -5
// 		responseVersion = 999999 // Use a special, high number to identify drafts
// 		if request.Token != nil && *request.Token != "" {
// 			responseToken = *request.Token
// 		} else {
// 			newToken, _ := generateRandomToken(16)
// 			responseToken = newToken
// 		}
// 	} else {
// 		// THIS IS A FINAL SUBMISSION
// 		responseStatus = 0
// 		if request.Token != nil && *request.Token != "" {
// 			responseToken = *request.Token
// 			responseVersion = *request.Version + 1
// 		} else {
// 			newToken, _ := generateRandomToken(16)
// 			responseToken = newToken
// 			responseVersion = 1
// 		}
// 	}

// 	// if request.Token != nil && *request.Token != "" {
// 	// 	responseToken = *request.Token
// 	// 	responseVersion = *request.Version + 1
// 	// } else {
// 	// 	newToken, err := generateRandomToken(16)
// 	// 	if err != nil {
// 	// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate submission token"})
// 	// 		return
// 	// 	}
// 	// 	responseToken = newToken
// 	// 	responseVersion = 1
// 	// }

// 	response := models.Response{
// 		ResearcherID:         request.ResearcherID,
// 		QuestionnaireID:      request.QuestionnaireID,
// 		Answers:              answersJSON,
// 		ResearchContext:      researchContextJSON,
// 		FinalRoute:           request.FinalRoute,
// 		SubmittedAt:          time.Now(),
// 		DiseaseName:          request.DiseaseName,
// 		Intervention:         request.Intervention,
// 		ConfidentialityLevel: request.ConfidentialityLevel,
// 		Status:               responseStatus,
// 		Version:              responseVersion,
// 		Token:                responseToken,
// 	}

// 	if err := database.DB.Create(&response).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save response", "details": err.Error()})
// 		return
// 	}

// 	if len(request.ExistingFileIDs) > 0 {
// 		var originalFiles []models.UploadedFile
// 		database.DB.Where("id IN ?", request.ExistingFileIDs).Find(&originalFiles)

// 		for _, originalFile := range originalFiles {
// 			newFileCopy := models.UploadedFile{
// 				ResponseID: response.ID,
// 				QuestionID: originalFile.QuestionID,
// 				FileName:   originalFile.FileName,
// 				MimeType:   originalFile.MimeType,
// 				FileData:   originalFile.FileData,
// 			}
// 			database.DB.Create(&newFileCopy)
// 		}
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"message":     "Response saved",
// 		"id":          response.ID,
// 		"token":       response.Token,
// 		"final_route": response.FinalRoute,
// 	})
// }

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
		Status               int                    `json:"status"`
		ResearcherName       string                 `json:"researcher_name"`
		ResearcherEmail      string                 `json:"researcher_email"`
		ExistingFileIDs      []uint                 `json:"existing_file_ids"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	answersJSON, _ := json.Marshal(request.Answers)
	researchContextJSON, _ := json.Marshal(request.ResearchContext)

	// --- REWRITTEN LOGIC ---

	if request.Status == -5 {
		// --- DRAFT LOGIC ---
		token := ""
		if request.Token != nil && *request.Token != "" {
			token = *request.Token
		} else {
			newToken, _ := generateRandomToken(16)
			token = newToken
		}

		var existingDraft models.Response
		err := database.DB.Where("token = ? AND version = ?", token, -999999).First(&existingDraft).Error

		if err == nil {
			// DRAFT EXISTS - UPDATE IT
			updateData := map[string]interface{}{
				"answers":               answersJSON,
				"research_context":      researchContextJSON,
				"final_route":           request.FinalRoute,
				"submitted_at":          time.Now(),
				"disease_name":          request.DiseaseName,
				"intervention":          request.Intervention,
				"confidentiality_level": request.ConfidentialityLevel,
				"researcher_id":         request.ResearcherID,
			}
			database.DB.Model(&existingDraft).Updates(updateData)
			c.JSON(http.StatusOK, gin.H{"message": "Draft updated", "id": existingDraft.ID, "token": existingDraft.Token, "version": existingDraft.Version})
		} else {
			// DRAFT DOES NOT EXIST - CREATE IT
			newDraft := models.Response{
				ResearcherID:         request.ResearcherID,
				QuestionnaireID:      request.QuestionnaireID,
				Answers:              answersJSON,
				ResearchContext:      researchContextJSON,
				FinalRoute:           request.FinalRoute,
				SubmittedAt:          time.Now(),
				DiseaseName:          request.DiseaseName,
				Intervention:         request.Intervention,
				ConfidentialityLevel: request.ConfidentialityLevel,
				Status:               -5,
				Version:              -999999, // Use new draft version number
				Token:                token,
			}
			if err := database.DB.Create(&newDraft).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create draft", "details": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Draft saved", "id": newDraft.ID, "token": newDraft.Token, "version": newDraft.Version})
		}

	} else {
		// --- FINAL SUBMISSION LOGIC ---
		var responseToken string
		var responseVersion int

		if request.Token != nil && *request.Token != "" {
			responseToken = *request.Token
			// Find the latest REAL version number from the DB, ignoring drafts.
			var latestVersion int64
			database.DB.Model(&models.Response{}).Where("token = ? AND version > 0", responseToken).Select("COALESCE(MAX(version), 0)").Row().Scan(&latestVersion)
			responseVersion = int(latestVersion) + 1
		} else {
			// This is a brand new submission.
			newToken, _ := generateRandomToken(16)
			responseToken = newToken
			responseVersion = 1
		}

		response := models.Response{
			ResearcherID:         request.ResearcherID,
			QuestionnaireID:      request.QuestionnaireID,
			Answers:              answersJSON,
			ResearchContext:      researchContextJSON,
			FinalRoute:           request.FinalRoute,
			SubmittedAt:          time.Now(),
			DiseaseName:          request.DiseaseName,
			Intervention:         request.Intervention,
			ConfidentialityLevel: request.ConfidentialityLevel,
			Status:               0, // Final submissions are always status 0
			Version:              responseVersion,
			Token:                responseToken,
		}
		if err := database.DB.Create(&response).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save response", "details": err.Error()})
			return
		}

		// Handle copying files from previous versions (this logic remains the same)
		if len(request.ExistingFileIDs) > 0 {
			var originalFiles []models.UploadedFile
			database.DB.Where("id IN ?", request.ExistingFileIDs).Find(&originalFiles)
			for _, originalFile := range originalFiles {
				newFileCopy := models.UploadedFile{ResponseID: response.ID, QuestionID: originalFile.QuestionID, FileName: originalFile.FileName, MimeType: originalFile.MimeType, FileData: originalFile.FileData}
				database.DB.Create(&newFileCopy)
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Response saved", "id": response.ID, "token": response.Token, "version": response.Version})
	}
}

func GetLatestResponseByToken(c *gin.Context) {
	token := c.Param("token")
	var response models.Response

	// WHY: We now order by the submission timestamp to get the absolute most recent save,
	// whether it's a draft (version -999999) or a numbered version.
	err := database.DB.
		Preload("UploadedFiles").
		Where("token = ?", token).
		Order("submitted_at desc"). // <-- This gets the latest record by time
		First(&response).Error

	if err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Response not found"})
		return
	}

	// The rest of the function remains the same...
	var researcher models.ResearcherData
	if err := database.DB.First(&researcher, response.ResearcherID).Error; err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Associated researcher not found"})
		return
	}

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
		"researcher_data":       researcher,
		"remark":                response.Remark,
	}
	c.JSON(http.StatusOK, combinedResult)
}

func FinalizeSubmission(c *gin.Context) {
	responseID := c.Param("id")
	var response models.Response
	var researcher models.ResearcherData

	if err := database.DB.First(&response, responseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Response not found"})
		return
	}

	if err := database.DB.First(&researcher, response.ResearcherID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Associated researcher not found"})
		return
	}

	if response.Status == -5 {
		// It's a draft, send the draft email
		go services.SendDraftNotification(
			researcher.Name,
			researcher.Email,
			researcher.ProjectName,
			response.Token,
		)
	} else {
		// It's a final submission, send the normal notification
		go services.SendSubmissionNotification(
			researcher.Name,
			researcher.Email,
			researcher.ProjectName,
			response.Token,
			response.Version,
		)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission finalized and notifications sent."})
}

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

	var latestResponse models.Response
	if err := database.DB.Where("token = ?", request.Token).Order("version desc").First(&latestResponse).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission not found"})
		return
	}

	if err := database.DB.Model(&models.Response{}).Where("id = ?", latestResponse.ID).Updates(map[string]interface{}{"status": request.Status, "remark": request.Remark}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	var researcher models.ResearcherData
	if err := database.DB.First(&researcher, latestResponse.ResearcherID).Error; err != nil {
		fmt.Println("Could not find researcher for email notification:", err)
	} else {
		if request.Status == -1 {
			go services.SendCancellationNotificationToAdmin(
				researcher.Name,
				researcher.ProjectName,
				latestResponse.Token,
			)
		} else {
			go services.SendStatusUpdateEmail(
				researcher.Name,
				researcher.Email,
				researcher.ProjectName,
				request.Status,
				request.Remark,
				latestResponse.Token,
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission status updated successfully"})
}

func GetResponseByTokenAndVersion(c *gin.Context) {
	token := c.Param("token")
	version := c.Param("version")
	var response models.Response

	err := database.DB.
		Preload("UploadedFiles").
		Where("token = ? AND version = ?", token, version).
		First(&response).Error

	if err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Specific response version not found"})
		return
	}

	var researcher models.ResearcherData
	if err := database.DB.First(&researcher, response.ResearcherID).Error; err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Associated researcher not found"})
		return
	}

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

func CancelSubmission(c *gin.Context) {
	var request struct {
		Token  string `json:"token"`
		Status int    `json:"status"`
		Remark string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

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
