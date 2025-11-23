#!/bin/bash

BASE_URL="http://localhost:5000"

echo "=========================================="
echo "Testing Focus Builder APIs"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Endpoint"
echo "GET $BASE_URL/health"
curl -s $BASE_URL/health | jq . || curl -s $BASE_URL/health
echo -e "\n"

# Test 2: Get Categories
echo "2. Testing Get All Categories"
echo "GET $BASE_URL/api/categories"
curl -s $BASE_URL/api/categories | jq . || curl -s $BASE_URL/api/categories
echo -e "\n"

# Test 3: Create a new category
echo "3. Testing Create Category"
echo "POST $BASE_URL/api/categories"
curl -s -X POST $BASE_URL/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Personal","color":"#9B86BD"}' | jq . || \
curl -s -X POST $BASE_URL/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Personal","color":"#9B86BD"}'
echo -e "\n"

# Test 4: Get categories again (should show new one)
echo "4. Testing Get Categories (after creation)"
echo "GET $BASE_URL/api/categories"
curl -s $BASE_URL/api/categories | jq . || curl -s $BASE_URL/api/categories
echo -e "\n"

# Test 5: Create a Task
echo "5. Testing Create Task"
echo "POST $BASE_URL/api/tasks"
TODAY=$(date +%Y-%m-%d)
curl -s -X POST $BASE_URL/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"category_id\":1,\"name\":\"Review code\",\"date\":\"$TODAY\",\"planned_start_time\":\"09:00\",\"planned_end_time\":\"10:00\"}" | jq . || \
curl -s -X POST $BASE_URL/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"category_id\":1,\"name\":\"Review code\",\"date\":\"$TODAY\",\"planned_start_time\":\"09:00\",\"planned_end_time\":\"10:00\"}"
echo -e "\n"

# Test 6: Get Active Task
echo "6. Testing Get Active Task"
echo "GET $BASE_URL/api/tasks/active"
curl -s $BASE_URL/api/tasks/active | jq . || curl -s $BASE_URL/api/tasks/active
echo -e "\n"

# Test 7: Get Tasks by Date
echo "7. Testing Get Tasks by Date"
echo "GET $BASE_URL/api/tasks/date/$TODAY"
curl -s $BASE_URL/api/tasks/date/$TODAY | jq . || curl -s $BASE_URL/api/tasks/date/$TODAY
echo -e "\n"

# Test 8: Create a Session for the Task
echo "8. Testing Create Session"
echo "POST $BASE_URL/api/sessions"
curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"task_id":1}' | jq . || \
curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"task_id":1}'
echo -e "\n"

# Test 9: Get In-Progress Session
echo "9. Testing Get In-Progress Session"
echo "GET $BASE_URL/api/sessions/in-progress"
curl -s $BASE_URL/api/sessions/in-progress | jq . || curl -s $BASE_URL/api/sessions/in-progress
echo -e "\n"

# Test 10: End Session
echo "10. Testing End Session"
echo "PATCH $BASE_URL/api/sessions/1/end"
curl -s -X PATCH $BASE_URL/api/sessions/1/end \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}' | jq . || \
curl -s -X PATCH $BASE_URL/api/sessions/1/end \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
echo -e "\n"

# Test 11: Complete Task
echo "11. Testing Complete Task"
echo "POST $BASE_URL/api/tasks/1/complete"
curl -s -X POST $BASE_URL/api/tasks/1/complete | jq . || \
curl -s -X POST $BASE_URL/api/tasks/1/complete
echo -e "\n"

# Test 12: Create Quick Focus Session
echo "12. Testing Quick Focus Session"
echo "POST $BASE_URL/api/sessions/quick-focus"
curl -s -X POST $BASE_URL/api/sessions/quick-focus \
  -H "Content-Type: application/json" \
  -d '{}' | jq . || \
curl -s -X POST $BASE_URL/api/sessions/quick-focus \
  -H "Content-Type: application/json" \
  -d '{}'
echo -e "\n"

# Test 13: Get Daily Stats
echo "13. Testing Get Daily Stats"
echo "GET $BASE_URL/api/sessions/stats/$TODAY"
curl -s $BASE_URL/api/sessions/stats/$TODAY | jq . || curl -s $BASE_URL/api/sessions/stats/$TODAY
echo -e "\n"

# Test 14: Get Tasks with Sessions
echo "14. Testing Get Tasks with Sessions"
echo "GET $BASE_URL/api/tasks/date/$TODAY/with-sessions"
curl -s $BASE_URL/api/tasks/date/$TODAY/with-sessions | jq . || \
curl -s $BASE_URL/api/tasks/date/$TODAY/with-sessions
echo -e "\n"

echo "=========================================="
echo "API Testing Complete!"
echo "=========================================="
