# 1️⃣ CREATE – Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Submit form
    F->>F: Client-side validation
    F->>B: POST /api/resources (JSON)

    B->>V: Validate request
    V-->>B: Validation result

    alt Validation fails
        B-->>F: 400 Bad Request + errors[]
        F-->>U: Show validation message
    else Validation OK
        B->>S: create Resource(data)
        S->>DB: INSERT INTO resources
        DB-->>S: Result / Duplicate error

        alt Duplicate
            S-->>B: Duplicate detected
            B-->>F: 409 Conflict
            F-->>U: Show duplicate message
        else Success
            S-->>B: Created resource
            B-->>F: 201 Created
            F-->>U: Show success message
        end
    end
```

# 2️⃣ READ — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (resources.js)
    participant B as Backend (Express Route)
    participant DB as PostgreSQL

    U->>F: Open resources page / refresh list
    F->>B: GET /api/resources
    B->>DB: SELECT * FROM resources ORDER BY created_at DESC
    DB-->>B: rows[] / error

    alt Read succeeds
        B-->>F: 200 OK + data[]
        F->>F: Cache resources and render list
        U->>F: Click resource from list
        F->>F: Read selected resource from resourcesCache
        F-->>U: Populate form in edit mode
    else Database error
        B-->>F: 500 Internal Server Error
        F->>F: Render empty list
        F-->>U: Keep UI usable / log error
    end
```

# 3️⃣ UPDATE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant L as Log Service
    participant DB as PostgreSQL

    U->>F: Select resource and edit fields
    F->>F: Client-side validation + change detection
    F->>B: PUT /api/resources/:id (JSON)

    B->>B: Parse resource id
    alt Invalid ID
        B-->>F: 400 Bad Request
        F-->>U: Show invalid ID message
    else Valid ID
        B->>V: Validate request body
        V-->>B: Validation result

        alt Validation fails
            B-->>F: 400 Bad Request + errors[]
            F-->>U: Show validation message
        else Validation OK
            B->>DB: UPDATE resources ... RETURNING *
            DB-->>B: Updated row / no row / duplicate error

            alt Resource not found
                B-->>F: 404 Not Found
                F-->>U: Show not found message
            else Duplicate name
                B-->>F: 409 Conflict
                F-->>U: Show duplicate message
            else Success
                B->>L: logEvent("Resource updated")
                L->>DB: INSERT INTO booking_log
                DB-->>L: Log written / log failure ignored
                L-->>B: Continue request
                B-->>F: 200 OK + updated resource
                F->>F: Clear form and reload list
                F-->>U: Show success message
            end
        end
    end
```

# 4️⃣ DELETE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant L as Log Service
    participant DB as PostgreSQL

    U->>F: Select resource and click Delete
    F->>B: DELETE /api/resources/:id

    B->>B: Parse resource id
    alt Invalid ID
        B-->>F: 400 Bad Request
        F-->>U: Show invalid ID message
    else Valid ID
        B->>DB: DELETE FROM resources WHERE id = $1
        DB-->>B: rowCount / error

        alt Resource not found
            B-->>F: 404 Not Found
            F-->>U: Show not found message
        else Success
            B->>L: logEvent("Resource deleted")
            L->>DB: INSERT INTO booking_log
            DB-->>L: Log written / log failure ignored
            L-->>B: Continue request
            B-->>F: 204 No Content
            F->>F: Clear form and reload list
            F-->>U: Show success message
        else Database error
            B-->>F: 500 Internal Server Error
            F-->>U: Show request error message
        end
    end
```
