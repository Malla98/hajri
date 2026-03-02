package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	app := pocketbase.New()

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		// SPA catch-all
		fs := http.FileServer(http.Dir("./pb_public"))
		e.Router.Any("/{path...}", func(c *core.RequestEvent) error {
			path := c.Request.URL.Path
			if strings.HasPrefix(path, "/api") || strings.HasPrefix(path, "/_/") {
				return c.Next()
			}
			fs.ServeHTTP(c.Response, c.Request)
			return nil
		})

		return e.Next()
	})

	log.Fatal(app.Start())
}
