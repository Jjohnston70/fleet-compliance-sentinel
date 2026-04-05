Swagger UI
Select a definition

SDLA REST API
SDLA Driver Status Service
1.2
OAS3
/api/swagger/sdla/swagger.json
A REST service to allow States to search for and retrieve driver status data from the Clearinghouse.

Contact Us - Website
Send email to Contact Us
Servers

/prod/
Authorize
Auth

POST
/api/Auth

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"username": "string",
"password": "string"
}
Responses
Code Description Links
200
Success

Media type

text/plain
Controls Accept header.
Example Value
Schema
string
No links
Health

GET
/api/Health

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Success

Media type

text/plain
Controls Accept header.
Example Value
Schema
string
No links
500
Server Error

No links
SDLADriverSearch

GET
/api/Driver/Status/ByNumber/{state}/{number}

Parameters
Try it out
Name Description
state \*
string
(path)
Country and subdivision code as defined in ISO 3166-2.

state
number \*
string
(path)
Number used to identify a CDL or CLP issued by the SDLA.

number
Responses
Code Description Links
200
Success

Media type

text/plain
Controls Accept header.
Example Value
Schema
true
No links
400
Bad Request

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
401
Unauthorized

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
403
Forbidden

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
404
Not Found

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
405
Method Not Allowed

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
415
Client Error

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
500
Server Error

No links

GET
/api/Driver/ByNumber/{state}/{number}
A search by country/subdivision and license number is expected to return only a single driver record, as license number and State uniqueness are internally enforced.

Parameters
Try it out
Name Description
state \*
string
(path)
Country and subdivision code as defined in ISO 3166-2.

state
number \*
string
(path)
Number used to identify a CDL or CLP issued by the SDLA.

number
Responses
Code Description Links
200
Success

Media type

text/plain
Controls Accept header.
Example Value
Schema
[
{
"DriverId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"FirstName": "string",
"LastName": "string",
"DateOfBirth": "2026-04-03",
"Number": "string",
"State": "string",
"IsProhibited": true,
"MarkedErroneousOn": "2026-04-03T08:01:25.115Z",
"Current": true,
"StatusDate": "2026-04-03T08:01:25.115Z",
"NotificationSentOn": "2026-04-03T08:01:25.115Z",
"Rescinds": [
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
]
}
]
No links
400
Bad Request

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
401
Unauthorized

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
403
Forbidden

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
404
Not Found

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
405
Method Not Allowed

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
415
Client Error

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
500
Server Error

No links

GET
/api/Driver/History/ByNumber/{state}/{number}
A search by country/subdivision and license number is expected to return historical status change records for a single driver record, as license number and State uniqueness are internally enforced.

Parameters
Try it out
Name Description
state \*
string
(path)
Country and subdivision code as defined in ISO 3166-2.

state
number \*
string
(path)
Number used to identify a CDL or CLP issued by the SDLA.

number
Responses
Code Description Links
200
Success

Media type

text/plain
Controls Accept header.
Example Value
Schema
[
{
"DriverId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"FirstName": "string",
"LastName": "string",
"DateOfBirth": "2026-04-03",
"Number": "string",
"State": "string",
"IsProhibited": true,
"MarkedErroneousOn": "2026-04-03T08:01:25.121Z",
"Current": true,
"StatusDate": "2026-04-03T08:01:25.121Z",
"NotificationSentOn": "2026-04-03T08:01:25.121Z",
"Rescinds": [
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
]
}
]
No links
400
Bad Request

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
401
Unauthorized

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
403
Forbidden

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
404
Not Found

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
405
Method Not Allowed

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
415
Client Error

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
500
Server Error

No links

GET
/api/Driver/ById/{id}
A search by driver ID can be used to complement an email-based push notification or to quickly re-query a driver’s status once an ID has previously been obtained.

A driver ID will never be re-used but may become inactive if the system identifies a second license number or set of license numbers which need to be merged into a single driver record. When this happens one of the driver records remains and the other is removed. A search by driver ID is guaranteed to return results for a single driver.

Parameters
Try it out
Name Description
id \*
string($uuid)
(path)
Unique identifier for the driver in the Clearinghouse

id
Responses
Code Description Links
200
Success

Media type

text/plain
Controls Accept header.
Example Value
Schema
[
{
"DriverId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"FirstName": "string",
"LastName": "string",
"DateOfBirth": "2026-04-03",
"Number": "string",
"State": "string",
"IsProhibited": true,
"MarkedErroneousOn": "2026-04-03T08:01:25.124Z",
"Current": true,
"StatusDate": "2026-04-03T08:01:25.124Z",
"NotificationSentOn": "2026-04-03T08:01:25.124Z",
"Rescinds": [
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
]
}
]
No links
400
Bad Request

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
401
Unauthorized

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
403
Forbidden

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
404
Not Found

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
405
Method Not Allowed

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
415
Client Error

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
500
Server Error

No links

GET
/api/Driver/History/ById/{id}
A search by driver ID can be used to complement an email-based push notification or to quickly re-query a driver’s status once an ID has previously been obtained.

A driver ID will never be re-used but may become inactive if the system identifies a second license number or set of license numbers which need to be merged into a single driver record. When this happens one of the driver records remains and the other is removed. A search by driver ID is guaranteed to return results for a single driver.

Parameters
Try it out
Name Description
id \*
string($uuid)
(path)
Unique identifier for the driver in the Clearinghouse

id
Responses
Code Description Links
200
Success

Media type

text/plain
Controls Accept header.
Example Value
Schema
[
{
"DriverId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"FirstName": "string",
"LastName": "string",
"DateOfBirth": "2026-04-03",
"Number": "string",
"State": "string",
"IsProhibited": true,
"MarkedErroneousOn": "2026-04-03T08:01:25.127Z",
"Current": true,
"StatusDate": "2026-04-03T08:01:25.127Z",
"NotificationSentOn": "2026-04-03T08:01:25.127Z",
"Rescinds": [
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
]
}
]
No links
400
Bad Request

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
401
Unauthorized

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
403
Forbidden

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
404
Not Found

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
405
Method Not Allowed

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
415
Client Error

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
500
Server Error

No links

GET
/api/Driver/Prohibited/{state}/{page}
A search by country/subdivision and prohibited status is expected to return a listing of all drivers currently in a prohibited status. The results will be returned in a paged result set ordered by the date the driver status was changed to prohibited and then by driver ID.

Parameters
Try it out
Name Description
state \*
string
(path)
Country and subdivision code as defined in ISO 3166-2.

state
page \*
integer($int32)
(path)
Page number for the returned results were 1 is the number of the first page.

page
Responses
Code Description Links
200
Success

Media type

text/plain
Controls Accept header.
Example Value
Schema
[
{
"DriverId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"FirstName": "string",
"LastName": "string",
"DateOfBirth": "2026-04-03",
"Number": "string",
"State": "string",
"IsProhibited": true,
"MarkedErroneousOn": "2026-04-03T08:01:25.130Z",
"Current": true,
"StatusDate": "2026-04-03T08:01:25.130Z",
"NotificationSentOn": "2026-04-03T08:01:25.130Z",
"Rescinds": [
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
]
}
]
No links
400
Bad Request

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
401
Unauthorized

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
403
Forbidden

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
405
Method Not Allowed

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
415
Client Error

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
500
Server Error

No links

GET
/api/Driver/ByDate/{state}/{notificationDateFrom}/{notificationDateTo}/{page}
A search to return a listing of all driver status changes in a country/subdivision over a given period of time. The results will be returned in a paged result set ordered by the date the driver status was changed to prohibited and then by driver id.

Parameters
Try it out
Name Description
state \*
string
(path)
Country and subdivision code as defined in ISO 3166-2.

state
notificationDateFrom \*
string($date-time)
(path)
Date and time of the driver status went into effect in ISO 8601 format. Date/time must be sent in UTC.

notificationDateFrom
notificationDateTo \*
string($date-time)
(path)
Date and time of the current driver status went into effect in ISO 8601 format. Date/time will be expressed in UTC.

notificationDateTo
page \*
integer($int32)
(path)
Page number for the returned results were 1 is the number of the first page.

page
Responses
Code Description Links
200
Success

Media type

text/plain
Controls Accept header.
Example Value
Schema
[
{
"DriverId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"FirstName": "string",
"LastName": "string",
"DateOfBirth": "2026-04-03",
"Number": "string",
"State": "string",
"IsProhibited": true,
"MarkedErroneousOn": "2026-04-03T08:01:25.132Z",
"Current": true,
"StatusDate": "2026-04-03T08:01:25.132Z",
"NotificationSentOn": "2026-04-03T08:01:25.132Z",
"Rescinds": [
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
]
}
]
No links
400
Bad Request

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
401
Unauthorized

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
403
Forbidden

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
405
Method Not Allowed

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
415
Client Error

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
500
Server Error

No links

POST
/api/Driver/Status/Error
Action to provide

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"StatusChangeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"Type": "InvalidFormat",
"Description": "string"
}
Responses
Code Description Links
200
Success

No links
400
Bad Request

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
401
Unauthorized

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
403
Forbidden

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
405
Method Not Allowed

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
415
Client Error

Media type

text/plain
Example Value
Schema
{
"type": "string",
"title": "string",
"status": 0,
"detail": "string",
"instance": "string",
"additionalProp1": "string",
"additionalProp2": "string",
"additionalProp3": "string"
}
No links
500
Server Error

No links

Schemas
AuthRequest{
username [...]
password [...]
}
DriverStatus{
DriverId [...]
Id [...]
FirstName [...]
LastName [...]
DateOfBirth [...]
Number [...]
State [...]
IsProhibited [...]
MarkedErroneousOn [...]
Current [...]
StatusDate [...]
NotificationSentOn [...]
Rescinds [...]
}
ErrorReportBody{
StatusChangeId [...]
Type ErrorType[...]
Description [...]
}
ErrorTypestring
Enum:
Array [ 6 ]
ProblemDetails{
type [...]
title [...]
status [...]
detail [...]
instance [...]
}
