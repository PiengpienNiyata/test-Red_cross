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
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid answersJSON"})
		return
	}

	researchContextJSON, err := json.Marshal(request.ResearchContext)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid researchContextJSON"})
		return
	}
	var responseToken string
	var responseVersion int

	if request.Token != nil && *request.Token != "" {
		responseToken = *request.Token
		responseVersion = *request.Version + 1
	} else {
		newToken, err := generateRandomToken(16)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate submission token"})
			return
		}
		responseToken = newToken
		responseVersion = 1
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

		Status:  0,
		Version: responseVersion,
		Token:   responseToken,
	}

	if err := database.DB.Create(&response).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save response", "details": err.Error()})
		return
	}

	if len(request.ExistingFileIDs) > 0 {
		var originalFiles []models.UploadedFile
		database.DB.Where("id IN ?", request.ExistingFileIDs).Find(&originalFiles)

		for _, originalFile := range originalFiles {
			newFileCopy := models.UploadedFile{
				ResponseID: response.ID,
				QuestionID: originalFile.QuestionID,
				FileName:   originalFile.FileName,
				MimeType:   originalFile.MimeType,
				FileData:   originalFile.FileData,
			}
			database.DB.Create(&newFileCopy)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Response saved",
		"id":          response.ID,
		"token":       response.Token,
		"final_route": response.FinalRoute,
	})
}

func GetLatestResponseByToken(c *gin.Context) {
	token := c.Param("token")
	var response models.Response

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

	go services.SendSubmissionNotification(
		researcher.Name,
		researcher.Email,
		researcher.ProjectName,
		response.Token,
		response.Version,
	)

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
