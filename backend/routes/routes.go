// In routes/routes.go
package routes

import (
	"backend/controllers"
	"backend/middleware" // <-- IMPORT THE MIDDLEWARE

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		// --- PUBLIC ROUTES ---
		api.POST("/login", controllers.Login) // Add the new login route
		api.POST("/response/cancel", controllers.CancelSubmission)
		api.POST("/researcher", controllers.SaveResearcher)
		api.POST("/response", controllers.SaveResponse)
		api.POST("/response/file", controllers.UploadFile)
		api.GET("/response/edit/:token", controllers.GetLatestResponseByToken)
		api.GET("/file/:id", controllers.GetFileByID)
		api.POST("/response/:id/finalize", controllers.FinalizeSubmission)

		// --- PROTECTED ADMIN ROUTES ---
		// Create a new group for routes that require authentication
		admin := api.Group("/")
		admin.Use(middleware.AuthMiddleware()) // Apply the middleware to this group
		{
			admin.GET("/submissions", controllers.GetFullSubmissionData)
			admin.POST("/response/status", controllers.UpdateSubmissionStatus)
			admin.GET("/versions/:token", controllers.GetAllVersionsByToken)
			admin.GET("/response/review/:token/:version", controllers.GetResponseByTokenAndVersion)
		}
	}
}
