package models

import "time"

type ResearcherData struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name"`
	ProjectName string    `json:"project_name"`
	BranchInfo  string    `json:"branch_info"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
}
