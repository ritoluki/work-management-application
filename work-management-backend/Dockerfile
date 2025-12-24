# Use Eclipse Temurin (recommended replacement for deprecated OpenJDK images)
# Note: Using alpine variant as eclipse-temurin doesn't have a -slim tag
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy Maven wrapper và pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run application
CMD ["java", "-jar", "target/work-management-backend-0.0.1-SNAPSHOT.jar"]
