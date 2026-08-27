# Etapa de construcao
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /usr/src/app

# Copia os arquivos do projeto
COPY src ./src
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Executar build da aplicação
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests
FROM eclipse-temurin:21-jre-alpine

WORKDIR /usr/app

# Copia o JAR
COPY --from=build /usr/src/app/target/*.jar app.jar

ENV TZ: America/Sao_Paulo

ENTRYPOINT ["java", "-Xms512m", "-Xmx800m", "-XX:MaxMetaspaceSize=192m", "-XX:MaxDirectMemorySize=128m", "-XX:+UseG1GC", "-XX:+UseStringDeduplication", "-XX:+ExitOnOutOfMemoryError", "-XX:MaxGCPauseMillis=200", "-XX:+ExplicitGCInvokesConcurrent", "-Dspring.profiles.active=${SPRING_PROFILE}", "-jar", "/usr/app/app.jar"]