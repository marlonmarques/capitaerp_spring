# backend/Dockerfile
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

# Copia
COPY mvnw .
COPY .mvn ./.mvn
COPY pom.xml .
COPY src ./src

COPY db/dados_prod.sqlite3 /opt/app/data/dados_prod.sqlite3

RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Variáveis de ambiente
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
