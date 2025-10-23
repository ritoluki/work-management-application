# Work Management Application
Steps:
1. Start backend : https://work-management-backend.onrender.com/
2. Start fontend : https://work-management-application.vercel.app/


A comprehensive work management application built with React frontend and Spring Boot backend.

## Project Structure

```
work-management-app/          # React Frontend
├── src/
│   ├── components/          # React components
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   └── context/            # React context
├── public/                 # Static assets
└── package.json

work-management-backend/      # Spring Boot Backend
├── src/
│   └── main/
│       └── java/
│           └── com/example/workmanagementbackend/
│               ├── config/     # Configuration classes
│               ├── controller/ # REST controllers
│               ├── dto/        # Data Transfer Objects
│               ├── entity/     # JPA entities
│               ├── repository/ # Data repositories
│               └── service/    # Business logic
└── pom.xml
```

## Features

- **User Management**: Registration, authentication, and user profiles
- **Task Management**: Create, update, and track tasks
- **Group Management**: Organize users into groups
- **Board Management**: Kanban-style task boards
- **Workspace Management**: Multi-workspace support
- **Permission System**: Role-based access control
- **Responsive Design**: Modern UI with Tailwind CSS
- **Theme Support**: Light and dark mode

## Technologies Used

### Frontend
- React 18
- Tailwind CSS
- Context API for state management
- Responsive design

### Backend
- Spring Boot 3
- Spring Security
- JPA/Hibernate
- H2 Database (development)
- Maven

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Java 17 or higher
- Maven

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd work-management-backend
   ```

2. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

The backend will start on `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd work-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## API Documentation

The backend provides RESTful APIs for:
- `/api/auth/**` - Authentication endpoints
- `/api/users/**` - User management
- `/api/workspaces/**` - Workspace management
- `/api/boards/**` - Board management
- `/api/groups/**` - Group management
- `/api/tasks/**` - Task management

## Database Schema

The application uses the following main entities:
- User
- Workspace
- Board
- Group
- Task

See `database_schema.sql` for detailed schema information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
