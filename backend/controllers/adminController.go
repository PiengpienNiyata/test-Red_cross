package controllers

import (
	"backend/database"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// This is a custom struct we'll use to shape the JSON response.
// It combines fields from both the 'responses' and 'researcher_data' tables.
type AdminSubmissionResponse struct {
	ID               uint      `json:"id"`
	ProjectName      string    `json:"project_name"`
	DiseaseName      string    `json:"disease_name"`
	ResearcherName   string    `json:"researcher_name"`
	BranchInfo       string    `json:"branch_info"`
	PhoneNumber      string    `json:"phone_number"`
	Email            string    `json:"email"`
	SubmittedAt      time.Time `json:"submitted_at"`
	FirstSubmittedAt time.Time `json:"first_submitted_at"` // <-- ADD THIS

	Version    int    `json:"version"`
	FinalRoute string `json:"final_route"`
	Status     int    `json:"status"`
	Token      string `json:"token"`
}

// --- THIS IS THE REWRITTEN FUNCTION ---
func GetFullSubmissionData(c *gin.Context) {
	var results []AdminSubmissionResponse

	// This is the core of the new logic. It uses a raw SQL query to do the heavy lifting
	// in the database, which is much more efficient than loading all data into Go first.
	//
	// Here's what it does:
	// 1. DISTINCT ON (r.token): This is a PostgreSQL feature. It ensures we only get ONE row for each unique 'token'.
	// 2. ORDER BY r.token, r.version DESC: This sorts the data so that the row with the highest 'version' for each token comes first.
	//    The DISTINCT ON then picks this first row, effectively giving us only the latest version of each submission.
	// 3. JOIN researcher_data rd ON r.researcher_id = rd.id: This combines the response data with the matching researcher data.
	// 4. SELECT ...: We select only the specific columns that the frontend dashboard needs.
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

	// If there are no submissions, return an empty array instead of null
	if results == nil {
		results = make([]AdminSubmissionResponse, 0)
	}

	c.JSON(http.StatusOK, results)
}

// --- ADD THIS ENTIRE NEW FUNCTION ---

// This struct is slightly different, it doesn't need all the researcher info
type VersionHistoryResponse struct {
	ID          uint      `json:"id"`
	Version     int       `json:"version"`
	SubmittedAt time.Time `json:"submitted_at"`
	Status      int       `json:"status"`
}

func GetAllVersionsByToken(c *gin.Context) {
	token := c.Param("token")
	var results []VersionHistoryResponse

	// This query gets all records for a specific token,
	// ordered by version so the newest is first.
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
