# timer-webhooks

An application for the creation, scheduling and firing of timers with Webhooks.

### API - 

1. Create Timer

   POST /timers
    {
      hours: 4,
      minutes: 0,
      seconds: 1,
      url: "https://someserver.com"
    }
   A timer can be created using this endpoint. The timer is created with a new id and the response is as follows:-

   {
    "id": "64ff71ca3df5dcb7760934c2",
    "time_left": 10
   }

2. Get timer status

   GET /timers/64ff71ca3df5dcb7760934c2
    will return a response such as:
  { id: 1, time_left: 64ff71ca3df5dcb7760934c2 }


When the timer is fired, a post request will be sent to the webhookUrl/id

---

### Tech Stack

1. **Primary Language - Typescript** - Typescript is the perfect language for a prototype such as this which can be extended to wide production level usage. With built in type safety, a strong community and good API/library support, it provides a stable and enjoyable environment to develop in.

2. **Database - MongoDB** - The app has been built with horizontal scaling in mind. The choice of DB and it's configuration was done keeping the following in mind -
     - NoSQL - Since our data is not relational with no need for complex joins, a NoSQL database has been chosen. This gives the flexibility for modifying the structure as we go along without the need for tedious data migrations. A NoSQL Database is also easier to distribute across several shards.
     - Consistency - A drawback of NoSQL databases can be Eventual Consistency. However the `findOneAndUpdate` method of MongoDB which is used to update the `isFired` status of the Timer is guaranteed to to atomic.
     - MEAN Stack - Mongo fits in well with the rest of the tech stack in terms of API support as well

3. **Libraries** - The libraries used in the app are as follows:
     -  MongoDB - As mentioned above
     -  Express - For creating the endpoints
     -  Axios - To send the POST requests. While node's native API can be used for this, Axios has been chosen for it's Ease of Use, automatic JSON conversion and Error Handling features
     -  Jest - For unit testing
     -  ESLint and Prettier - for automatic code formatting and linting

---

### Timer Scheduling and Firing  
  Timer mechanism is as follows:-
  - When a request comes in, error handling and sanity checks are first performed on it and the Timer is then stored in the DB with the `dueTimestamp` column which is calculated from the request data. The timer id is generated as an `ObjectId` using Mongo's inbuilt mechanisms
  - At the same time, the Timer is asynchronously scheduled.
  - When the timer is due to to be fired, the Timer state is first checked in the Database. If the Timer has not been fired yet, an atomic update is made to the DB to ensure that the timer is fired just once and the webhook URL POST request is made after that.
  - If the service is killed/crashes before the timer needs to be fired, the scheduling is handled as follows on startup -
      - The app checks all the unfired timers in the DB. The timers that have already exipred are fired instantly.
      - Any timers that have not been fired are then scheduled to be fired at the appropriate timestamps.
      - While this method is `async`, it is not `await`ed at the app startup since we want the app to be able to respond to web requests as soon as the database is initialized.

---

### Next steps  
  1. The databse is indexed based on the `isFired` column. While this should make reads faster, an idea can be to move the expired Timers to their own lighweight persistable datastructure that only stores the ids since no other data is needed from them. This way, all the timers in the DB will have not been fired yet.
  2. To improve horizontal scalability, a **message queue** paradigm can be used. In this case, the service can be split into two further services, one that just handles the timer creation and insertion in the database. A separate scheduling service can then be used for long-polling the database for timers that need to be fired and then add them to the queue. Only one instance of the app will pick up this message from the queue and fire it.
  3. Testing - While comprehensive unit tests have been written using Jest, Integration and End to End testing can be added, especially if the service will be split up as mentioned above
  4. A nodemon script can be written for hot-reloading of the project.
   
