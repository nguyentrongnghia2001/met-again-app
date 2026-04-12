# Moderation And Interaction Flow

## Chat Messages

`chat:message` is available only during an active session.

Server validation rules:
- the sender must have an active partner
- the session must exist in live memory
- text is trimmed
- empty messages are rejected
- messages longer than 500 characters are rejected

On success:
1. the server emits the message to the partner
2. the server increments `messageCount` on the session document
3. the sender receives the created message through the acknowledgement payload

## Media State Sync

`media:state` lets one peer tell the other whether microphone or camera is enabled.

The server:
1. normalizes the payload to booleans
2. stores the latest state in the live client record
3. forwards `partner:media-state` to the current partner if one exists

This is transient state and is not written to MongoDB.

## Reports

`session:report` is only valid when both peers are still in an active session.

Validation rules:
- `reason` is required
- `details` is optional and trimmed

On success:
1. a `Report` document is created
2. the related session increments `reportsCount`
3. the reporting user receives `report:submitted`
4. the socket acknowledgement also returns the created metadata

## UX Expectation

Frontend flows should make reporting non-blocking for the rest of the session unless product requirements explicitly say otherwise. The current server stores the report but does not automatically end the call.
