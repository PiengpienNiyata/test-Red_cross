package models

type Questionnaire struct {
	ID    uint   `json:"id" gorm:"primaryKey"`
	Title string `json:"title"`
}
