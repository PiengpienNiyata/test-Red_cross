package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.POST("/login", controllers.Login)
		api.POST("/response/cancel", controllers.CancelSubmission)
		api.POST("/researcher", controllers.SaveResearcher)
		api.POST("/response", controllers.SaveResponse)
		api.POST("/response/file", controllers.UploadFile)
		api.GET("/response/edit/:token", controllers.GetLatestResponseByToken)
		api.GET("/file/:id", controllers.GetFileByID)
		api.POST("/response/:id/finalize", controllers.FinalizeSubmission)

		admin := api.Group("/")
		admin.Use(middleware.AuthMiddleware())
		{
			admin.GET("/submissions", controllers.GetFullSubmissionData)
			admin.POST("/response/status", controllers.UpdateSubmissionStatus)
			admin.GET("/versions/:token", controllers.GetAllVersionsByToken)
			admin.GET("/response/review/:token/:version", controllers.GetResponseByTokenAndVersion)
		}
	}
}
