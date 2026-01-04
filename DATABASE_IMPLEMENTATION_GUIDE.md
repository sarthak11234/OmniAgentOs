# Database Features Implementation Guide

## What's Been Set Up

### 1. ✅ Database Models Created (`backend/app/db/models.py`)
- **User**: Stores user information
  - `id`, `username`, `email`, `created_at`
  - Relationship to `Result` records

- **Result**: Stores all ML operation results
  - `id`, `user_id`, `task_type` (transcription/generation/summarization)
  - `input_text`, `input_filename`, `output_text`
  - `processing_time_seconds`, `model_used`, `status`, `error_message`
  - `created_at`, `updated_at`

- **TaskType**: Enum for task types
  - `TRANSCRIPTION`, `GENERATION`, `SUMMARIZATION`

### 2. ✅ Database Service Created (`backend/app/services/database_service.py`)
Ready-to-use methods:
- `get_or_create_user()`: Get or create user
- `create_result()`: Save a result
- `get_user_results()`: Fetch user's results (with filtering/pagination)
- `get_result()`: Get single result
- `delete_result()`: Delete a result

### 3. ✅ Pydantic Schemas Created (`backend/app/schemas/result.py`)
- `ResultResponse`: API response schema
- `ResultListResponse`: List with pagination
- `UserResponse`: User info response

### 4. ✅ Results API Endpoints Created (`backend/app/api/v1/results.py`)
Ready endpoints:
- `POST /api/v1/results` - Create a result
- `GET /api/v1/results/{result_id}` - Get single result
- `GET /api/v1/users/{user_id}/results` - Get user's results (filterable by task_type)
- `DELETE /api/v1/results/{result_id}` - Delete result
- `GET /api/v1/stats?user_id=1` - Get user statistics

## What You Need to Do Tomorrow

### Step 1: Update ML Endpoints to Save Results (⚠️ IMPORTANT)

Update these files to save results after processing:

**`backend/app/api/v1/audio.py`** (Transcription)
```python
# After transcribing, save result:
from app.services.database_service import DatabaseService
from app.schemas.result import TaskType

# In transcribe_endpoint():
result = DatabaseService.create_result(
    session=db,
    user_id=1,  # TODO: Get from auth/header
    task_type=models.TaskType.TRANSCRIPTION,
    input_filename=file.filename,
    output_text=transcript,
    model_used="whisper-small",
    processing_time_seconds=elapsed_time
)
```

**`backend/app/api/v1/text.py`** (Generation)
```python
# Similar pattern for text generation
result = DatabaseService.create_result(
    session=db,
    user_id=1,
    task_type=models.TaskType.GENERATION,
    input_text=request.prompt,
    output_text=result_text,
    model_used="gpt-2"
)
```

**`backend/app/api/v1/summarize.py`** (Summarization)
```python
# Similar pattern for summarization
result = DatabaseService.create_result(
    session=db,
    user_id=1,
    task_type=models.TaskType.SUMMARIZATION,
    input_text=request.text,
    output_text=summary,
    model_used="bart-large-cnn"
)
```

### Step 2: Add Database Session to Endpoints

Each endpoint needs a database session dependency:
```python
from sqlalchemy.orm import Session
from app.core import database

def get_db():
    db = Session(database.engine)
    try:
        yield db
    finally:
        db.close()

# In endpoint signature:
async def transcribe_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
```

### Step 3: Create Frontend Results Page

Create `frontend/app/results/page.tsx`:
- Display list of user's results
- Filter by task type (transcription/generation/summarization)
- Show input/output side-by-side
- Delete results button
- Show processing time and timestamp

### Step 4: Create Results Card Component

Create `frontend/components/ResultCard.tsx`:
- Display single result nicely
- Show task type with icon
- Display input/output in expandable sections
- Show metadata (time, date, model)

### Step 5: Update Dashboard

Add "View History" button to main dashboard that links to results page.

## Database Schema (Auto-created on startup)

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Results table
CREATE TABLE results (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    task_type VARCHAR NOT NULL,
    input_text TEXT,
    input_filename VARCHAR,
    output_text TEXT,
    processing_time_seconds INTEGER,
    model_used VARCHAR,
    status VARCHAR DEFAULT 'completed',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Testing the Setup

Run these curl commands:

```bash
# Create a user (already done, ID=1 for admin)
curl http://localhost:8000/api/v1/results -X POST \
  -H "Content-Type: application/json" \
  -d '{"task_type":"transcription","input_filename":"test.mp3","output_text":"hello world","model_used":"whisper-small"}?user_id=1'

# Get user's results
curl 'http://localhost:8000/api/v1/users/1/results'

# Get stats
curl 'http://localhost:8000/api/v1/stats?user_id=1'
```

## Tips for Tomorrow

1. **Default User ID**: Use `user_id=1` (admin) for now. You can add auth later.
2. **Timing**: Wrap ML operations in `time.perf_counter()` to measure processing_time_seconds
3. **Error Handling**: Set `status='failed'` and populate `error_message` on exceptions
4. **Frontend State**: Use React hooks to manage loading/error states during save
5. **Pagination**: Results endpoint supports `limit` and `skip` query params

## Files Created/Modified

✅ `backend/app/db/models.py` - Updated with Result model
✅ `backend/app/services/database_service.py` - CRUD operations
✅ `backend/app/schemas/result.py` - API schemas
✅ `backend/app/api/v1/results.py` - API endpoints
✅ `backend/app/api/api_router.py` - Updated to include results router

📝 TODO TOMORROW:
- [ ] Update audio.py, text.py, summarize.py to save results
- [ ] Add database session dependency to ML endpoints
- [ ] Create results page component
- [ ] Create result card component
- [ ] Update dashboard with history link
- [ ] Test end-to-end flow

## Next Steps After That

1. **Authentication**: Add JWT tokens to identify users automatically
2. **Advanced Features**:
   - Batch processing
   - Result sharing
   - Export results to PDF/CSV
   - Search/filtering by date range
3. **Monitoring**:
   - Performance metrics dashboard
   - Average processing times
   - Popular prompts/files
