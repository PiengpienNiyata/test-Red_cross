package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		// api.GET("/questions", controllers.GetQuestions)
		// api.GET("/questions/:section_id", controllers.GetQuestionsBySection)
		// api.GET("/sections", controllers.GetSections)
		// api.GET("/sections/questionnaire/:questionnaire_id", controllers.GetSectionByQuestionnaireID)

		api.POST("/researcher", controllers.SaveResearcher)
		api.POST("/response", controllers.SaveResponse)
		api.POST("/response/file", controllers.UploadFile)

		api.GET("/submissions", controllers.GetFullSubmissionData)

	}
}
