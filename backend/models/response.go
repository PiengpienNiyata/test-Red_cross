package models

import (
	"time"

	"gorm.io/datatypes"
)

type Response struct {
	ID                   uint           `json:"id" gorm:"primaryKey"`
	ResearcherID         uint           `json:"researcher_id"`
	QuestionnaireID      uint           `json:"questionnaire_id"`
	Answers              datatypes.JSON `json:"answers"`
	ResearchContext      datatypes.JSON `json:"research_context"`
	Survey               datatypes.JSON `json:"survey"`
	FinalRoute           string         `json:"final_route"`
	SubmittedAt          time.Time      `json:"submitted_at" gorm:"autoCreateTime"`
	DiseaseName          string         `json:"disease_name"`
	Intervention         string         `json:"intervention"`
	ConfidentialityLevel string         `json:"confidentiality_level"`
	UploadedFiles        []UploadedFile `json:"uploaded_files" gorm:"foreignKey:ResponseID"`
	Status               int            `json:"status" gorm:"default:0"`
	Version              int            `json:"version" gorm:"default:1"`
	Token                string         `json:"token" gorm:"uniqueIndex:idx_token_version"`
	// ResearcherData       ResearcherData `json:"researcher_data" gorm:"foreignKey:ResearcherID"`
}
