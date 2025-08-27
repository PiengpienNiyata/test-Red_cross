package controllers

import (
	"backend/database"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type AdminSubmissionResponse struct {
	ID               uint      `json:"id"`
	ProjectName      string    `json:"project_name"`
	DiseaseName      string    `json:"disease_name"`
	ResearcherName   string    `json:"researcher_name"`
	BranchInfo       string    `json:"branch_info"`
	PhoneNumber      string    `json:"phone_number"`
	Email            string    `json:"email"`
	SubmittedAt      time.Time `json:"submitted_at"`
	FirstSubmittedAt time.Time `json:"first_submitted_at"`
	Version          int       `json:"version"`
	FinalRoute       string    `json:"final_route"`
	Status           int       `json:"status"`
	Token            string    `json:"token"`
}

func GetFullSubmissionData(c *gin.Context) {
	var results []AdminSubmissionResponse
	err := database.DB.Raw(`
		SELECT DISTINCT ON (r.token)
			r.id,
			rd.project_name,
			r.disease_name,
			rd.name as researcher_name,
			rd.branch_info,
			rd.phone_number,
			rd.email,
			r.submitted_at,
        (SELECT submitted_at FROM responses WHERE token = r.token ORDER BY version ASC LIMIT 1) as first_submitted_at,
			r.submitted_at,
			r.version,
			r.final_route,
			r.status,
			r.token
		FROM responses r
		JOIN researcher_data rd ON r.researcher_id = rd.id
		ORDER BY r.token, r.version DESC
	`).Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch submission data", "details": err.Error()})
		return
	}

	if results == nil {
		results = make([]AdminSubmissionResponse, 0)
	}

	c.JSON(http.StatusOK, results)
}

type VersionHistoryResponse struct {
	ID          uint      `json:"id"`
	Version     int       `json:"version"`
	SubmittedAt time.Time `json:"submitted_at"`
	Status      int       `json:"status"`
}

func GetAllVersionsByToken(c *gin.Context) {
	token := c.Param("token")
	var results []VersionHistoryResponse

	err := database.DB.Table("responses").
		Select("id", "version", "submitted_at", "status").
		Where("token = ?", token).
		Order("version DESC").
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch version history"})
		return
	}

	if results == nil {
		results = make([]VersionHistoryResponse, 0)
	}

	c.JSON(http.StatusOK, results)
}
