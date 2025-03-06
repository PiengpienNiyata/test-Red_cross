package models

import (
	"gorm.io/gorm"
)

// Question struct to map database table
type Question struct {
	ID           uint            `json:"id" gorm:"primaryKey"`
	SectionID    uint            `json:"section_id"`
	QuestionText string          `json:"question_text"`
	QuestionType string          `json:"question_type"`
	Choices      []string        `json:"choices" gorm:"type:jsonb"`
	CreatedAt    *gorm.DeletedAt `json:"created_at"`
}
