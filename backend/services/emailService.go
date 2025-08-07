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
	adminEmail := os.Getenv("REVIEWER_EMAIL")

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

	reviewURL := fmt.Sprintf("%s/review-response/%s", frontendURL, token)
	dashboardURL := fmt.Sprintf("%s/admin/dashboard", frontendURL)

	// adminSubject := fmt.Sprintf("New Submission (Version %d): %s", version, projectName)
	// // 2. Add the reviewURL to the email body
	// adminBody := fmt.Sprintf(
	// 	"A submission has been received:\n\nProject: %s\nResearcher: %s\nEmail: %s\nVersion: %d\nToken: %s\n\nClick here to review the submission:\n%s",
	// 	projectName, researcherName, researcherEmail, version, token, reviewURL,
	// )
	adminSubject := fmt.Sprintf("New Submission (Version %d): %s", version, projectName)
	adminBody := fmt.Sprintf(
		"A submission has been received:\n\nProject: %s\nResearcher: %s\nEmail: %s\nVersion: %d\n\nClick here to review this specific submission:\n%s\n\nOr go to the main dashboard to see all submissions:\n%s",
		projectName, researcherName, researcherEmail, version, reviewURL, dashboardURL,
	)
	adminMsg := []byte("To: " + adminEmail + "\r\n" +
		"Subject: " + adminSubject + "\r\n" +
		"\r\n" +
		adminBody + "\r\n")

	// Send the email to the admin
	go smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{adminEmail}, adminMsg)
}

// --- ADD THIS ENTIRE NEW FUNCTION ---
func SendStatusUpdateEmail(researcherName, researcherEmail, projectName string, status int, remark, token string) {
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	fromEmail := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")

	auth := smtp.PlainAuth("", fromEmail, password, smtpHost)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173" // Fallback for local dev
	}
	editURL := fmt.Sprintf("%s/edit-response/%s", frontendURL, token)

	var subject, body string

	switch status {
	case 2: // Approved
		subject = fmt.Sprintf("Your Submission for '%s' has been Approved", projectName)
		body = fmt.Sprintf("Hello %s,\n\nCongratulations! Your submission for the project '%s' has been reviewed and approved.\n\nThank you for your contribution.\n\nBest regards,\nThe RIRM Team", researcherName, projectName)
	case 1: // Need Revise
		subject = fmt.Sprintf("Action Required: Revisions Requested for '%s'", projectName)
		body = fmt.Sprintf("Hello %s,\n\nYour submission for the project '%s' has been reviewed, and the reviewer has requested some revisions.\n\nReviewer's Remarks:\n\"%s\"\n\nPlease use the link below to access and edit your submission:\n%s\n\nBest regards,\nThe RIRM Team", researcherName, projectName, remark, editURL)
	case -2: // Rejected
		subject = fmt.Sprintf("Update on Your Submission for '%s'", projectName)
		body = fmt.Sprintf("Hello %s,\n\nThank you for your submission for the project '%s'. After careful review, we regret to inform you that it will not be proceeding at this time.\n\nReviewer's Remarks:\n\"%s\"\n\nWe appreciate your interest and effort.\n\nBest regards,\nThe RIRM Team", researcherName, projectName, remark)
	default:
		// Don't send an email for unknown statuses
		return
	}

	msg := []byte("To: " + researcherEmail + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" +
		body + "\r\n")

	smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{researcherEmail}, msg)
}

// SendCancellationNotificationToAdmin sends an email to the reviewer when a project is canceled.
func SendCancellationNotificationToAdmin(researcherName, projectName, token string) {
	// Read SMTP configuration from environment variables
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	fromEmail := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")
	adminEmail := os.Getenv("REVIEWER_EMAIL")

	auth := smtp.PlainAuth("", fromEmail, password, smtpHost)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173" // A fallback for local development
	}
	reviewURL := fmt.Sprintf("%s/review-response/%s", frontendURL, token)

	subject := fmt.Sprintf("Project Canceled: %s", projectName)
	body := fmt.Sprintf(
		"This is a notification that the following project has been canceled by the researcher:\n\n"+
			"Project: %s\n"+
			"Researcher: %s\n\n"+
			"No further action is required. You can view the final state of the submission at the link below if needed:\n%s",
		projectName, researcherName, reviewURL,
	)

	msg := []byte("To: " + adminEmail + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" +
		body + "\r\n")

	// Send the email to the admin
	smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{adminEmail}, msg)
}
