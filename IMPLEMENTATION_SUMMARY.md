# Roadmap Modification Feature Implementation Summary

## Status: ✅ COMPLETE

All 9 phases of the implementation have been completed successfully.

## Overview

The roadmap modification feature enables users to chat with their existing travel itineraries using natural language. The system uses LLM to classify user intent and either modifies the itinerary, asks for clarification, answers questions, or rejects inappropriate requests.

## Implementation Phases

### ✅ Phase 1: Database Migration and Entity Changes
- Created migration `1770600000000-AddModificationFieldsToItineraryJob.ts`
- Added 4 new columns to `itinerary_job_table`:
  - `job_type` - Distinguishes GENERATION vs MODIFICATION jobs
  - `intent_status` - Stores LLM intent classification result
  - `diff_keys` - Tracks which itinerary nodes changed
  - `user_query` - Stores original user message
- Added composite index on (travel_course_id, job_type, created_at)
- Updated `ItineraryJob` entity with new enums and methods

### ✅ Phase 2: DTO Files
Created 4 new DTO files:
1. `ChatWithItineraryRequest.ts` - User chat message input
2. `ChatWithItineraryResponse.ts` - Job ID response
3. `ItineraryModificationJobStatusResponse.ts` - Status with intent
4. `ItineraryModificationCallbackRequest.ts` - Python callback payload

### ✅ Phase 3: Exception Classes
Created 2 new exception classes:
1. `ItineraryNotFoundException.ts` (404)
2. `UnauthorizedItineraryAccessException.ts` (403)

Added error codes:
- `ITINERARY_NOT_FOUND = 'HE_050401'`
- `UNAUTHORIZED_ITINERARY_ACCESS = 'HE_050402'`

### ✅ Phase 4: ItineraryModificationService
Created service for handling modification requests:
- `chatWithItinerary()` - Validates permissions, creates job, enqueues to BullMQ
- `getModificationJobStatus()` - Returns job status with intent info

### ✅ Phase 5: ItineraryModificationCallbackService
Created callback handler service:
- `handleSuccess()` - Routes based on intent_status
- `handleFailure()` - Handles errors
- `updateTravelCourse()` - Transactionally updates itinerary (for SUCCESS intent)
- `saveChatHistory()` - Stores USER and AI messages

### ✅ Phase 6: ItineraryModificationProcessor
Created BullMQ worker that:
- Loads TravelCourse with all relations
- Builds current itinerary JSON
- Loads last 10 chat messages for context
- Calls Python LLM server
- Retries 3 times with exponential backoff

### ✅ Phase 7: ItineraryController Updates
Added 3 new endpoints:
1. `POST /v1/itineraries/:id/chat` - Send chat message
2. `GET /v1/itineraries/modification-jobs/:jobId/status` - Poll status
3. `POST /v1/itineraries/:jobId/chat-result` - Python callback (internal)

### ✅ Phase 8: ItineraryModule Updates
- Registered `CourseAiChat` entity
- Registered new BullMQ queue: `itinerary-modification`
- Added all new services and processors to providers

### ✅ Phase 9: ItineraryJobRepository Updates
- Added `findModificationJobsByTravelCourseId()` method

## API Flow

```
User → POST /v1/itineraries/:id/chat
  ↓
NestJS creates MODIFICATION job → BullMQ enqueue
  ↓
Worker loads itinerary + chat history → Python POST /api/v1/chat
  ↓
Python classifies intent → Processes request → Callback
  ↓
NestJS updates TravelCourse (if SUCCESS) + saves chat → Redis publish
  ↓
Client polls GET /v1/itineraries/modification-jobs/:jobId/status
```

## Intent Classification

The LLM classifies each user request into one of 4 intents:

1. **SUCCESS** - Modification applied successfully
   - TravelCourse is updated transactionally
   - Chat history saved
   - diff_keys returned

2. **ASK_CLARIFICATION** - Need more information
   - No TravelCourse update
   - Clarification message saved
   - User can respond with more details

3. **GENERAL_CHAT** - Informational question
   - No TravelCourse update
   - Answer saved in chat history

4. **REJECTED** - Request violates policy
   - No TravelCourse update
   - Rejection reason saved

## Key Features

✅ **Async Processing** - Non-blocking via BullMQ
✅ **Intent Classification** - LLM-powered request categorization
✅ **Context Preservation** - Last 10 chat messages included
✅ **Transactional Updates** - All-or-nothing TravelCourse modifications
✅ **Chat History** - Full conversation stored in CourseAiChat
✅ **Permission Checks** - User ownership validation
✅ **Idempotency** - Duplicate callbacks safely ignored
✅ **Auto Retry** - 3 attempts with exponential backoff
✅ **Diff Tracking** - Changed nodes identified (diff_keys)

## Files Created/Modified

### New Files (10)
1. `src/database/migrations/1770600000000-AddModificationFieldsToItineraryJob.ts`
2. `src/domain/itinerary/presentation/dto/request/ChatWithItineraryRequest.ts`
3. `src/domain/itinerary/presentation/dto/request/ItineraryModificationCallbackRequest.ts`
4. `src/domain/itinerary/presentation/dto/response/ChatWithItineraryResponse.ts`
5. `src/domain/itinerary/presentation/dto/response/ItineraryModificationJobStatusResponse.ts`
6. `src/domain/itinerary/exception/ItineraryNotFoundException.ts`
7. `src/domain/itinerary/exception/UnauthorizedItineraryAccessException.ts`
8. `src/domain/itinerary/service/ItineraryModificationService.ts`
9. `src/domain/itinerary/service/ItineraryModificationCallbackService.ts`
10. `src/domain/itinerary/processor/ItineraryModificationProcessor.ts`

### Modified Files (5)
1. `src/domain/itinerary/entity/ItineraryJob.entity.ts`
2. `src/domain/itinerary/presentation/ItineraryController.ts`
3. `src/domain/itinerary/ItineraryModule.ts`
4. `src/domain/itinerary/persistence/ItineraryJobRepository.ts`
5. `src/domain/itinerary/exception/code/ItineraryErrorCode.ts`

## Next Steps

### 1. Run Database Migration
```bash
npm run migration:run
```

### 2. Test the Endpoints

**Example 1: Successful Modification**
```bash
# Send chat message
curl -X POST http://localhost:8080/api/v1/itineraries/{itinerary-id}/chat \
  -H "Authorization: Bearer {token}" \
  -d '{"message": "1일차 2번째 장소를 미술관으로 바꿔줘"}'
# Response: 202 { job_id: "...", status: "PENDING" }

# Poll status
curl -X GET http://localhost:8080/api/v1/itineraries/modification-jobs/{job-id}/status \
  -H "Authorization: Bearer {token}"
# Response: { status: "SUCCESS", intent_status: "SUCCESS", message: "...", diff_keys: [...] }
```

**Example 2: Clarification Request**
```bash
curl -X POST http://localhost:8080/api/v1/itineraries/{id}/chat \
  -d '{"message": "좀 더 재미있게 만들어줘"}'
# Expected: intent_status: "ASK_CLARIFICATION"
```

**Example 3: General Question**
```bash
curl -X POST http://localhost:8080/api/v1/itineraries/{id}/chat \
  -d '{"message": "이 로드맵의 총 예상 비용은 얼마야?"}'
# Expected: intent_status: "GENERAL_CHAT"
```

### 3. Python Team Coordination

The Python team needs to implement the `/api/v1/chat` endpoint that:
- Accepts: `{ job_id, callback_url, current_itinerary, user_query, session_history }`
- Classifies user intent
- For SUCCESS: Modifies itinerary + returns diff_keys
- For others: Returns appropriate message
- Calls back to: `POST {callback_url}` with results

### 4. Frontend Integration

Update the frontend to:
1. Add chat UI component for itineraries
2. Call `POST /v1/itineraries/:id/chat` endpoint
3. Poll `GET /v1/itineraries/modification-jobs/:jobId/status`
4. Display messages based on intent_status
5. Show diff highlights for modified places

## Testing Checklist

**Functional Tests:**
- [ ] Successful modification (intent: SUCCESS)
- [ ] Clarification request (intent: ASK_CLARIFICATION)
- [ ] General question (intent: GENERAL_CHAT)
- [ ] Rejected request (intent: REJECTED)
- [ ] Multiple consecutive modifications
- [ ] Chat history context (verify 10 messages loaded)

**Security Tests:**
- [ ] Permission check (403 for other user's itinerary)
- [ ] Not found check (404 for invalid itinerary_id)
- [ ] ServiceSecretGuard on callback endpoint

**Reliability Tests:**
- [ ] Idempotency (duplicate callback ignored)
- [ ] Retry mechanism (Python server timeout)
- [ ] Transaction rollback on error
- [ ] Redis pub/sub notification

---

**Implementation Completed**: 2026-02-12
**Total Time**: ~2 hours
**Status**: ✅ Ready for Testing
