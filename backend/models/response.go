package models

import "time"

type Response struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	ResearcherID    uint      `json:"researcher_id"`
	QuestionnaireID uint      `json:"questionnaire_id"`
	Answers         string    `json:"answers" gorm:"type:jsonb"`
	Survey          string    `json:"survey" gorm:"type:jsonb"`
	FinalRoute      string    `json:"final_route"`
	SubmittedAt     time.Time `json:"submitted_at" gorm:"autoCreateTime"`
	DiseaseName     string    `json:"disease_name"`
	Intervention    string    `json:"intervention"`
	ResearchContext string    `json:"research_context" gorm:"type:jsonb"`
}
