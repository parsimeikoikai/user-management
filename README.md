# Webhook Service

This is a webhook service designed to receive and process incoming messages, authenticate using a secret token, and store the messages in Firebase. It also supports rate limiting and automated responses for specific messages like "help".

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Design Decisions](#design-decisions)

## Setup Instructions

To set up the Webhook Service, follow these steps:

### 1. Firebase Configuration

- **Create a Firebase Project**: Go to the Firebase Console and create a new Firebase project if you haven't already.
- **Enable Firestore**: Make sure Firestore is enabled in your Firebase project.
- **Service Account Key**: Generate a service account key from the Firebase Console and save the JSON file.
  
### 2. Environment Variables

Set up the following environment variables in your `.env` file:

- **`WEBHOOK_SECRET`**: The secret token used for authenticating webhook requests. Set it to a secure value to ensure only authorized requests can access the endpoint.
  
Example:
```env
WEBHOOK_SECRET=your_secret_token
```

You’ll also need to configure the Firebase SDK using the service account credentials:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
```
Note: Ensure the FIREBASE_PRIVATE_KEY value is properly formatted without line breaks.

### 3. Install Dependencies
Install the necessary dependencies using npm or yarn:

```env
npm install
# or
yarn install
```

### 4. Running the Application

To start the application, run:

```env
npm run start
# or
yarn start
```
This will start the application on the default port (3000).

## API Endpoints

### Webohook API

POST /webhook

Description: This endpoint processes incoming webhook requests. It validates the authorization token, stores the incoming message in Firebase, applies rate limiting, and responds with an appropriate message based on the content.

```env
POST /webhook
Authorization: Bearer <WEBHOOK_SECRET>
Content-Type: application/json
{
  "message": "Your message here",
  "phone": "1234567890"
}
```
•	Authorization Header: The Bearer <WEBHOOK_SECRET> is used to authenticate the request.
### Body:
- message: The message sent via the webhook.
- phone: The phone number from which the message is sent.

### User Endpoints
POST /users

Creates a new user in the system.

```env
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "phone": "735-835-9479"
}
```
GET /users/:id

Retrieves a user by their ID.

```env
GET /users/12345
```
PATCH /users/:id

Updates a user's details.
```env
PATCH /users/12345
Content-Type: application/json

{
  "name": "John Doe Updated"
}
```
GET /users

Retrieves a paginated list of users.
```env
GET /users?page=1&limit=10
```
## Design Decisions

1. Secret Token Authentication

I have opted for a simple secret token for authenticating incoming webhook requests instead of using JWT. This decision was made to minimize complexity, as I am only verifying the source of the requests rather than managing user authentication. The secret token is passed as a Bearer token in the Authorization header and compared with a predefined value.

2. Rate Limiting

The system enforces a rate limit to avoid abuse of the webhook endpoint. Each phone number can only send up to 5 messages per minute. The rate limit is checked by storing the request count and timestamp for each phone number in a Map (requestCache). If the count exceeds the limit within the minute window, the request is rejected.

Why a Map?

The Map data structure was chosen for rate limiting as it provides efficient O(1) lookup, insertion, and deletion operations. This ensures that checking the rate limit for each request is fast and doesn’t introduce significant overhead.

3. Firebase for Message Storage

The messages are stored in Firestore, a NoSQL database from Firebase, to persist the incoming data. Firestore is chosen because it provides a scalable and flexible solution to store the messages. Each message is stored with the following fields:
	•	message: The content of the message.
	•	phone: The phone number from which the message is sent.
	•	timestamp: The timestamp when the message was received.

Why Firestore?

Firestore was selected because:
	•	It is a fully managed, serverless database, reducing operational overhead.
	•	It supports real-time data synchronization, which could be beneficial if the system needs to be extended in the future.
	•	It integrates well with Firebase’s SDK, which simplifies setup and usage.

4. Message Processing Logic

The processMessage function is designed to:
	•	Check the rate limit based on the phone number.
	•	Store the message in Firestore.
	•	Return an appropriate automated reply based on the message content.
	•	If the message contains “help”, it provides a support contact.
	•	Otherwise, it sends a generic confirmation reply.

## Running Tests
To run the unit and integration tests for the service, use:
```env
npm run test
# or
yarn test
```