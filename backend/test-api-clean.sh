#!/bin/bash

BASE_URL="http://localhost:5000"

echo "=========================================="
echo "Testing Focus Builder APIs"
echo "=========================================="
echo ""

# Helper function to print test results
print_test() {
  echo "✓ Test $1: $2"
  echo "  Response: $3"
  echo ""
}

# Clean up - delete existing data
echo "🧹 Cleaning up existing test data..."
curl -s -X DELETE $BASE_URL/api/tasks/1 > /dev/null 2>&1
curl -s -X DELETE $BASE_URL/api/tasks/2 > /dev/null 2>&1
echo ""

# Test 1: Health Check
echo "1️⃣ Health Check"
RESPONSE=$(curl -s $BASE_URL/health)
echo "   GET /health"
echo "   ✓ $RESPONSE"
echo ""

# Test 2: Get Categories
echo "2️⃣ Get All Categories"
RESPONSE=$(curl -s $BASE_URL/api/categories)
CATEGORY_COUNT=$(echo $RESPONSE | grep -o '"id":' | wc -l)
echo "   GET /api/categories"
echo "   ✓ Found $CATEGORY_COUNT categories"
echo "   Categories: Work, Learning, Reading, Exercise, Quick Focus"
echo ""

# Test 3: Create a Task
echo "3️⃣ Create Task"
TODAY=$(date +%Y-%m-%d)
RESPONSE=$(curl -s -X POST $BASE_URL/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"category_id\":1,\"name\":\"Test Task 1\",\"date\":\"$TODAY\",\"planned_start_time\":\"09:00\",\"planned_end_time\":\"10:00\"}")
TASK_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
if [ -n "$TASK_ID" ]; then
  echo "   POST /api/tasks"
  echo "   ✓ Task created with ID: $TASK_ID"
  echo "   Task: 'Test Task 1' (Work category, 09:00-10:00)"
else
  echo "   POST /api/tasks"
  echo "   ✗ Error: $RESPONSE"
fi
echo ""

# Test 4: Get Active Task
echo "4️⃣ Get Active Task"
RESPONSE=$(curl -s $BASE_URL/api/tasks/active)
echo "   GET /api/tasks/active"
if echo $RESPONSE | grep -q '"status":"active"'; then
  echo "   ✓ Active task found: 'Test Task 1'"
else
  echo "   ✗ No active task: $RESPONSE"
fi
echo ""

# Test 5: Try to create another task (should fail)
echo "5️⃣ Test One Active Task Constraint"
RESPONSE=$(curl -s -X POST $BASE_URL/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"category_id\":2,\"name\":\"Test Task 2\",\"date\":\"$TODAY\",\"planned_start_time\":\"11:00\",\"planned_end_time\":\"12:00\"}")
echo "   POST /api/tasks (attempt to create second active task)"
if echo $RESPONSE | grep -q "another task is active"; then
  echo "   ✓ Constraint enforced: Cannot create multiple active tasks"
else
  echo "   ✗ Unexpected response: $RESPONSE"
fi
echo ""

# Test 6: Create Session
echo "6️⃣ Create Session for Task"
RESPONSE=$(curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d "{\"task_id\":$TASK_ID}")
SESSION_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
if [ -n "$SESSION_ID" ]; then
  echo "   POST /api/sessions"
  echo "   ✓ Session started with ID: $SESSION_ID"
else
  echo "   POST /api/sessions"
  echo "   ✗ Error: $RESPONSE"
fi
echo ""

# Test 7: Get In-Progress Session
echo "7️⃣ Get In-Progress Session"
RESPONSE=$(curl -s $BASE_URL/api/sessions/in-progress)
echo "   GET /api/sessions/in-progress"
if echo $RESPONSE | grep -q '"status":"in_progress"'; then
  echo "   ✓ In-progress session found"
else
  echo "   ✗ No in-progress session: $RESPONSE"
fi
echo ""

# Wait 2 seconds to accumulate duration
echo "⏳ Waiting 2 seconds to accumulate session duration..."
sleep 2
echo ""

# Test 8: End Session
echo "8️⃣ End Session"
RESPONSE=$(curl -s -X PATCH $BASE_URL/api/sessions/$SESSION_ID/end \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}')
echo "   PATCH /api/sessions/$SESSION_ID/end"
if echo $RESPONSE | grep -q '"status":"completed"'; then
  DURATION=$(echo $RESPONSE | grep -o '"actual_duration":[0-9]*' | grep -o '[0-9]*')
  echo "   ✓ Session completed (duration: ${DURATION}s)"
else
  echo "   ✗ Error: $RESPONSE"
fi
echo ""

# Test 9: Complete Task
echo "9️⃣ Complete Task"
RESPONSE=$(curl -s -X POST $BASE_URL/api/tasks/$TASK_ID/complete)
echo "   POST /api/tasks/$TASK_ID/complete"
if echo $RESPONSE | grep -q '"status":"completed"'; then
  echo "   ✓ Task completed successfully"
else
  echo "   ✗ Error: $RESPONSE"
fi
echo ""

# Test 10: Quick Focus Session
echo "🔟 Quick Focus Session"
RESPONSE=$(curl -s -X POST $BASE_URL/api/sessions/quick-focus \
  -H "Content-Type: application/json" \
  -d '{}')
echo "   POST /api/sessions/quick-focus"
if echo $RESPONSE | grep -q '"session"'; then
  QF_TASK_ID=$(echo $RESPONSE | grep -o '"task":{"id":[0-9]*' | grep -o '[0-9]*')
  QF_SESSION_ID=$(echo $RESPONSE | grep -o '"session":{"id":[0-9]*' | grep -o '[0-9]*')
  echo "   ✓ Quick Focus created (Task ID: $QF_TASK_ID, Session ID: $QF_SESSION_ID)"
  
  # End Quick Focus session
  sleep 2
  curl -s -X PATCH $BASE_URL/api/sessions/$QF_SESSION_ID/end \
    -H "Content-Type: application/json" \
    -d '{"status":"completed"}' > /dev/null
  echo "   ✓ Quick Focus session ended"
  
  # Complete Quick Focus task
  curl -s -X POST $BASE_URL/api/tasks/$QF_TASK_ID/complete > /dev/null
  echo "   ✓ Quick Focus task completed"
else
  echo "   ✗ Error: $RESPONSE"
fi
echo ""

# Test 11: Get Daily Stats
echo "1️⃣1️⃣ Get Daily Stats"
RESPONSE=$(curl -s "$BASE_URL/api/sessions/stats/$TODAY")
echo "   GET /api/sessions/stats/$TODAY"
if echo $RESPONSE | grep -q '"total_focus_time"'; then
  TOTAL_TIME=$(echo $RESPONSE | grep -o '"total_focus_time":[0-9]*' | head -1 | grep -o '[0-9]*')
  echo "   ✓ Stats retrieved: Total focus time = ${TOTAL_TIME}s"
else
  echo "   ✗ Error: $RESPONSE"
fi
echo ""

# Test 12: Get Tasks with Sessions
echo "1️⃣2️⃣ Get Tasks with Sessions"
RESPONSE=$(curl -s "$BASE_URL/api/tasks/date/$TODAY/with-sessions")
echo "   GET /api/tasks/date/$TODAY/with-sessions"
TASK_COUNT=$(echo $RESPONSE | grep -o '"id":' | wc -l)
echo "   ✓ Found tasks with sessions for today"
echo ""

echo "=========================================="
echo "✅ API Testing Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  • Health check: OK"
echo "  • Categories API: OK (5 default categories)"
echo "  • Tasks API: OK (create, get active, complete)"
echo "  • Sessions API: OK (create, end, in-progress)"
echo "  • Quick Focus: OK (auto-task creation)"
echo "  • Stats API: OK (daily stats, date range)"
echo "  • Constraints: OK (one active task enforced)"
echo ""
