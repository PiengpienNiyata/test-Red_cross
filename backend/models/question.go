package models

import (
	"time"
)

type Question struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	SectionID    uint      `json:"section_id"`
	QuestionText string    `json:"question_text"`
	QuestionType string    `json:"question_type"`
	Choices      string    `json:"choices" gorm:"type:jsonb"`
	CreatedAt    time.Time `json:"created_at"`
}
