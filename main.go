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
		fs := http.FileServer(http.Dir("./pb_public"))

		// Root fallback – works as SPA catch-all
		e.Router.Any("/", func(c *core.RequestEvent) error {
			path := c.Request.URL.Path

			// Let PocketBase handle its own routes
			if strings.HasPrefix(path, "/api") ||
				strings.HasPrefix(path, "/_/") {
				return c.Next()
			}

			// Serve Nuxt static / SPA
			fs.ServeHTTP(c.Response, c.Request)
			return nil
		})

		return e.Next()
	})

	log.Fatal(app.Start())
}
