FROM maven:3.9.6-eclipse-temurin-22 AS build
WORKDIR /app

# Copy wrapper and maven config so builds use the project's mvnw when present
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src ./src

# Use the wrapper if present, otherwise fall back to the container's mvn
RUN if [ -x ./mvnw ]; then ./mvnw -B clean package -DskipTests; else mvn -B clean package -DskipTests; fi

FROM eclipse-temurin:22-jre-alpine
WORKDIR /app

# Copy the fat jar produced by the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
