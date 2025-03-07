package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.GET("/users", controllers.GetUsers)
		api.POST("/users", controllers.CreateUser)

		api.GET("/questions", controllers.GetQuestions)
		api.GET("/questions/:section_id", controllers.GetQuestionsBySection)

		api.GET("/sections", controllers.GetSections)
		api.GET("/sections/questionnaire/:questionnaire_id", controllers.GetSectionByQuestionnaireID)
	}
}
