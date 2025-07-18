# MilkTracker
# I am using this for my personal use :/

A Node.js based REST API for tracking milk entries with quantity and rates. This application helps manage and track milk production/collection data.

## Features

- Create, Read, Update, and Delete milk entries
- Each entry contains date, quantity, and rate information
- Standardized API responses with consistent DTO structure

## Prerequisites

- Node.js (v14 or higher recommended)
- MySQL database

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MilkTracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up your MySQL database and update the connection details in `models/db.js`

4. Create the required table:
```sql
CREATE TABLE milk_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Create Entry
- **POST** `/api/milk`
- **Body:**
```json
{
    "date": "2024-03-20",
    "quantity": 10.5,
    "rate": 45.00
}
```
- **Response:**
```json
{
    "error": 0,
    "data": {
        "id": 1
    },
    "message": "Entry created successfully"
}
```

### Get All Entries
- **GET** `/api/milk`
- **Response:**
```json
{
    "error": 0,
    "data": [
        {
            "id": 1,
            "date": "2024-03-20",
            "quantity": 10.5,
            "rate": 45.00,
            "created_at": "2024-03-20T10:00:00Z"
        }
    ],
    "message": "Success"
}
```

### Update Entry
- **PUT** `/api/milk/:id`
- **Body:**
```json
{
    "date": "2024-03-20",
    "quantity": 11.5,
    "rate": 46.00
}
```
- **Response:**
```json
{
    "error": 0,
    "data": null,
    "message": "Updated successfully"
}
```

### Delete Entry
- **DELETE** `/api/milk/:id`
- **Response:**
```json
{
    "error": 0,
    "data": null,
    "message": "Deleted successfully"
}
```

## Response Structure

All API responses follow a standard DTO (Data Transfer Object) structure:

```javascript
{
    error: 0,      // 0 for success, non-zero for errors
    data: null,    // The actual response data
    message: ""    // Response message
}
```

## Error Handling

In case of errors, the response will maintain the same structure but with:
- `error` set to a non-zero value
- `data` set to null
- `message` containing the error description

Example error response:
```json
{
    "error": 1,
    "data": null,
    "message": "Error message description"
}
```

## Running the Application

Start the server:
```bash
node app.js
```

The API will be available at `http://localhost:3000` (or your configured port).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 