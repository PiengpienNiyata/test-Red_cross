package controllers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// In a real application, this would come from an environment variable or a secure config
var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY")) // Make sure to set this environment variable!

type Credentials struct {
	Password string `json:"password"`
	Email    string `json:"email"`
}

// In controllers/authController.go

func Login(c *gin.Context) {
	var creds Credentials
	if err := c.ShouldBindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Read the expected credentials from environment variables
	expectedEmail := os.Getenv("REVIEWER_EMAIL")
	expectedPassword := os.Getenv("REVIEWER_PASSWORD")

	// --- IMPORTANT SECURITY NOTE ---
	// In a real application, you would hash the password with bcrypt and compare the hash.
	// Storing plain-text passwords is not secure. We are proceeding as requested.
	if creds.Email != expectedEmail || creds.Password != expectedPassword {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Set the expiration time to 6 hours from now
	expirationTime := time.Now().Add(3 * time.Hour)
	// expirationTime := time.Now().Add(3 * time.Minute)

	claims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expirationTime),
		Issuer:    "rirm-app",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
