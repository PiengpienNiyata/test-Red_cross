package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		// These routes are for a future dynamic questionnaire system
		api.GET("/questions", controllers.GetQuestions)
		api.GET("/questions/:section_id", controllers.GetQuestionsBySection)
		api.GET("/sections", controllers.GetSections)
		api.GET("/sections/questionnaire/:questionnaire_id", controllers.GetSectionByQuestionnaireID)

		// Routes for the current response submission flow
		api.POST("/researcher", controllers.SaveResearcher)
		api.POST("/response", controllers.SaveResponse)

		// --- NEW ROUTE ADDED ---
		// This route handles individual file uploads
		api.POST("/response/file", controllers.UploadFile)
	}
}
