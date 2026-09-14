FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml ./
COPY services/api/pom.xml services/api/pom.xml
COPY services/api/src services/api/src
RUN mvn -B -pl services/api -am package
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S duze && adduser -S duze -G duze
WORKDIR /app
COPY --from=build /build/services/api/target/duze-api-0.1.0-SNAPSHOT.jar app.jar
USER duze
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
