# timer-webhooks

An application for the creation, scheduling, and firing of timers with Webhooks.

## API 

### 1. Create Timer

- **Endpoint:** `POST /timers`
  
```json
{
  "hours": 4,
  "minutes": 0,
  "seconds": 1,
  "url": "https://someserver.com"
}
```

On successful creation, the response is:

```json
{
  "id": "64ff71ca3df5dcb7760934c2",
  "time_left": 10
}
```

### 2. Get Timer Status

- **Endpoint:** `GET /timers/id`
Sample response:

```json
{
  "id": "64ff71ca3df5dcb7760934c2",
  "time_left": 10
}
```

Upon timer expiration, a POST request will be made to webhookUrl/id.

---


## Tech Stack

### 1. Primary Language - Typescript
Typescript is ideal for prototypes like this which can be scaled to production. With built-in type safety, a strong community, and robust API/library support, it's both stable and enjoyable for development.

### 2. Database - MongoDB
Designed with horizontal scalability in mind:

- NoSQL: Chosen due to the non-relational nature of our data. It provides flexibility in schema modifications without tedious migrations and offers ease in distribution across multiple shards.
- Consistency: Although some NoSQL databases might suffer from Eventual Consistency, MongoDB's findOneAndUpdate method, which updates the isFired status, is atomic.
- MEAN Stack: MongoDB complements the tech stack, especially with API support.

### 3. Libraries
- MongoDB: For data operations.
- Express: To define endpoints.
- Axios: For sending POST requests. Preferred over Node's native API for its ease of use, automatic JSON conversion, and error handling.
- Jest: For unit testing.
- ESLint & Prettier: For consistent code linting and formatting.


---


## Timer Scheduling and Firing

- Upon receiving a request, initial validations are conducted. The timer is stored in the database with a dueTimestamp computed from the request.
- Timer IDs are auto-generated using MongoDB's `ObjectId`.
- Timers are asynchronously scheduled upon creation. When due, the system verifies the timer's state in the database. If it hasn't fired, an atomic database update ensures a single firing, followed by a webhook POST request.
- Service interruptions are managed as follows:
   - On restart, the system checks for unfired timers in the database. Those past their expiration are fired immediately.
   - Remaining timers are rescheduled.
   - This method is asynchronous, ensuring quick service availability post-restart.
 
---

## Next Steps

1.**Database Optimization:** Consider moving expired timers to a lightweight, persistent data structure containing only their IDs. This ensures that all active timers in the database haven't been fired.
2.**Extending Horizontal Scalability:** Implement a message queue paradigm. Split the service: one handles timer creation and database insertion; the other schedules timers and adds them to the queue. This ensures only one app instance fires the timer.
3.**Testing:** Add Integration and End-to-End tests.
4.**Development Efficiency:** Introduce a nodemon script for hot-reloading during development.
