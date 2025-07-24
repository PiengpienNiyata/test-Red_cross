package services

import (
	"fmt"
	"net/smtp"
	"os"
)

// SendSubmissionNotification sends emails to the user and admin after a submission.
func SendSubmissionNotification(researcherName, researcherEmail, projectName, token string, version int) {
	// Read SMTP configuration from environment variables
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	fromEmail := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")
	adminEmail := "jirawatsong99@gmail.com" // Admin's email

	auth := smtp.PlainAuth("", fromEmail, password, smtpHost)

	// --- Email to User ---
	userSubject := ""
	userBody := ""
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173" // A fallback for local development
	}
	editURL := fmt.Sprintf("%s/edit-response/%s", frontendURL, token)
	if version > 1 {
		userSubject = "Your RIRM Submission has been Updated"
		userBody = fmt.Sprintf("Hello %s,\n\nThis is a confirmation that your response for the project '%s' has been successfully updated to version %d.\n\nTo view or make further edits, you can use the following link:\n%s\n\nThank you.", researcherName, projectName, version, editURL)
	} else {
		userSubject = "RIRM Submission Received"
		userBody = fmt.Sprintf("Hello %s,\n\nThank you for your submission for the project '%s'.\n\nYour response has been saved successfully. If you need to make any changes, you can use your unique edit link at any time:\n%s\n\nBest regards,\nThe RIRM Team", researcherName, projectName, editURL)
	}

	userMsg := []byte("To: " + researcherEmail + "\r\n" +
		"Subject: " + userSubject + "\r\n" +
		"\r\n" +
		userBody + "\r\n")

	// Send the email to the user
	go smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{researcherEmail}, userMsg)

	// --- Email to Admin ---
	adminSubject := fmt.Sprintf("New Submission (Version %d): %s", version, projectName)
	adminBody := fmt.Sprintf("A submission has been received:\n\nProject: %s\nResearcher: %s\nEmail: %s\nVersion: %d\nToken: %s", projectName, researcherName, researcherEmail, version, token)
	adminMsg := []byte("To: " + adminEmail + "\r\n" +
		"Subject: " + adminSubject + "\r\n" +
		"\r\n" +
		adminBody + "\r\n")

	// Send the email to the admin
	go smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{adminEmail}, adminMsg)
}
