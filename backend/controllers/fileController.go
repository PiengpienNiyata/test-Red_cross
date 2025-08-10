package controllers

import (
	"backend/database"
	"backend/models"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func formatQuestionID(qID string) string {
	switch {
	case qID == "201.5":
		return "B-1(staging)"
	case strings.HasPrefix(qID, "10") && len(qID) == 3:
		return fmt.Sprintf("A-%s", qID[2:])
	case strings.HasPrefix(qID, "20") && len(qID) == 3:
		return fmt.Sprintf("B-%s", qID[2:])
	}
	return qID // Fallback for any other ID format
}

func UploadFile(c *gin.Context) {
	err := c.Request.ParseMultipartForm(10 << 20)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing form"})
		return
	}

	file, handler, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error retrieving file"})
		return
	}
	defer file.Close()

	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading file content"})
		return
	}

	responseID, err := strconv.ParseUint(c.Request.FormValue("response_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid response_id"})
		return
	}

	questionID := c.Request.FormValue("question_id")

	uploadedFile := models.UploadedFile{
		ResponseID: uint(responseID),
		QuestionID: questionID,
		FileName:   handler.Filename,
		MimeType:   handler.Header.Get("Content-Type"),
		FileData:   fileBytes,
	}

	if err := database.DB.Create(&uploadedFile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file to database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "file_id": uploadedFile.ID})
}

// func GetFileByID(c *gin.Context) {
// 	fileID := c.Param("id")

// 	var file models.UploadedFile
// 	if err := database.DB.First(&file, fileID).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
// 		return
// 	}

// 	c.Header("Content-Type", file.MimeType)

// 	c.Data(http.StatusOK, file.MimeType, file.FileData)
// }

func GetFileByID(c *gin.Context) {
	fileID := c.Param("id")

	var file models.UploadedFile
	if err := database.DB.First(&file, fileID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	// Fetch related data to get the project name (same as before)
	var response models.Response
	if err := database.DB.First(&response, file.ResponseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Associated response not found"})
		return
	}

	var researcher models.ResearcherData
	if err := database.DB.First(&researcher, response.ResearcherID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Associated researcher not found"})
		return
	}

	// Build the custom filename (same as before)
	projectName := researcher.ProjectName
	formattedQNo := formatQuestionID(file.QuestionID)
	originalFilename := file.FileName
	sanitizedProjectName := strings.ReplaceAll(projectName, " ", "_")
	newFilename := fmt.Sprintf("%s_Q%s_%s", sanitizedProjectName, formattedQNo, originalFilename)

	fmt.Printf("DEBUG: Attempting to set download filename to: %s\n", newFilename)

	// --- NEW CONDITIONAL LOGIC ---
	// For file types the browser can't open, force a download ("attachment").
	// For others (PDFs, images), suggest opening them in the browser ("inline").
	dispositionType := "inline"
	switch file.MimeType {
	case "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
		"application/msword", // .doc
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
		"application/vnd.ms-excel", // .xls
		"application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
		"application/vnd.ms-powerpoint":                                             // .ppt
		dispositionType = "attachment"
	}

	// Set the headers with the correct disposition type
	c.Header("Content-Disposition", fmt.Sprintf("%s; filename=\"%s\"", dispositionType, newFilename))
	c.Header("Content-Type", file.MimeType)
	c.Data(http.StatusOK, file.MimeType, file.FileData)
}
