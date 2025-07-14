package controllers

import (
	"backend/database"
	"backend/models"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func UploadFile(c *gin.Context) {
	// Parse the multipart form
	err := c.Request.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing form"})
		return
	}

	// Get the file from the form
	file, handler, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error retrieving file"})
		return
	}
	defer file.Close()

	// Read file content into a byte slice
	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading file content"})
		return
	}

	// Get metadata from the form values
	responseID, err := strconv.ParseUint(c.Request.FormValue("response_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid response_id"})
		return
	}

	questionID := c.Request.FormValue("question_id")

	// Create the file model
	uploadedFile := models.UploadedFile{
		ResponseID: uint(responseID),
		QuestionID: questionID,
		FileName:   handler.Filename,
		MimeType:   handler.Header.Get("Content-Type"),
		FileData:   fileBytes,
	}

	// Save the file record to the database
	if err := database.DB.Create(&uploadedFile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file to database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "file_id": uploadedFile.ID})
}
