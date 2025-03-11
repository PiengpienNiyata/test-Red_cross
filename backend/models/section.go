package models

type Section struct {
	ID              uint   `json:"id" gorm:"primaryKey"`
	QuestionnaireID uint   `json:"questionnaire_id"`
	SectionName     string `json:"section_name"`
}
