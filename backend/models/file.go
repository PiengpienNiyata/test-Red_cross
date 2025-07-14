package models

import "time"

type UploadedFile struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	ResponseID uint      `json:"response_id"`
	QuestionID string    `json:"question_id"`
	FileName   string    `json:"file_name"`
	MimeType   string    `json:"mime_type"`
	FileData   []byte    `json:"-" gorm:"type:bytea"` // file_data is stored as byte array
	UploadedAt time.Time `json:"uploaded_at" gorm:"autoCreateTime"`
}
