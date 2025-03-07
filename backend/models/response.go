package models

import "time"

type Response struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	ResearcherID    uint      `json:"researcher_id"`
	QuestionnaireID uint      `json:"questionnaire_id"`
	Answers         string    `json:"answers" gorm:"type:jsonb"`
	SubmittedAt     time.Time `json:"submitted_at" gorm:"autoCreateTime"`
}
