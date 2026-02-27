package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/cron"
)

func main() {
	app := pocketbase.New()

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		// Register crons once server is ready
		registerCrons(app)

		// SPA catch-all for Nuxt frontend
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

func registerCrons(app *pocketbase.PocketBase) {
	c := cron.New()

	// Every day at 4:00 AM
	c.MustAdd("auto_absent", "0 4 * * *", func() {
		if err := autoMarkAbsent(app); err != nil {
			log.Printf("[auto_absent] ERROR: %v", err)
		}
	})

	c.Start()
	log.Println("[cron] Registered: auto_absent @ 4:00 AM daily")
}

func autoMarkAbsent(app *pocketbase.PocketBase) error {
	today := time.Now().Format("2006-01-02")
	targetDate := today + " 00:00:00.000Z"

	log.Printf("[auto_absent] Running for date: %s", today)

	// 1. Get all active workers
	type Employee struct {
		ID   string `db:"id"`
		Name string `db:"name"`
	}

	var employees []Employee
	err := app.DB().
		Select("id", "name").
		From("employees").
		AndWhere(dbx.HashExp{"active": true, "role": "worker"}).
		All(&employees)
	if err != nil {
		return fmt.Errorf("fetch employees: %w", err)
	}

	if len(employees) == 0 {
		log.Println("[auto_absent] No active workers found, skipping.")
		return nil
	}

	log.Printf("[auto_absent] Found %d active workers", len(employees))

	// 2. Get employees who already have a record today
	type ExistingRecord struct {
		EmployeeID string `db:"employee"`
	}

	var existing []ExistingRecord
	err = app.DB().
		Select("employee").
		From("attendance").
		AndWhere(dbx.HashExp{"date": targetDate}).
		All(&existing)
	if err != nil {
		return fmt.Errorf("fetch existing attendance: %w", err)
	}

	// Build set of already-marked employee IDs
	markedIDs := make(map[string]bool, len(existing))
	for _, r := range existing {
		markedIDs[r.EmployeeID] = true
	}

	// 3. Filter to employees with no record today
	var missing []Employee
	for _, emp := range employees {
		if !markedIDs[emp.ID] {
			missing = append(missing, emp)
		}
	}

	if len(missing) == 0 {
		log.Println("[auto_absent] All workers already have records, nothing to do.")
		return nil
	}

	log.Printf("[auto_absent] Creating absent records for %d workers", len(missing))

	// 4. Get the attendance collection
	collection, err := app.FindCollectionByNameOrId("attendance")
	if err != nil {
		return fmt.Errorf("find attendance collection: %w", err)
	}

	// 5. Create absent record for each missing employee
	created, skipped := 0, 0

	for _, emp := range missing {
		record := core.NewRecord(collection)
		record.Set("employee", emp.ID)
		record.Set("date", targetDate)
		record.Set("status", "absent")
		record.Set("advance_amount", 0)
		record.Set("remark", "")

		if err := app.Save(record); err != nil {
			log.Printf("[auto_absent] Skipped %s: %v", emp.Name, err)
			skipped++
			continue
		}
		created++
	}

	log.Printf("[auto_absent] Done — created: %d, skipped: %d", created, skipped)
	return nil
}
