package models

import "time"

type ResearcherData struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name"`
	ProjectName string    `json:"project_name"`
	BranchInfo  string    `json:"branch_info"`
	PhoneNumber string    `json:"phone_number"`
	Email       string    `json:"email"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	// Responses   []Response `json:"responses" gorm:"foreignKey:ResearcherID"`
}
