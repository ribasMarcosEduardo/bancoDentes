# Etapa de construcao
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /usr/src/app

# Copia os arquivos do projeto
COPY src ./src
COPY pom.xml .

# Definir ARG para o perfil Spring
ARG SPRING_PROFILE=default

# Executa o Maven para construir o artefato com o perfil especificado
RUN mvn clean package -U -DskipTests -f pom.xml

# Etapa final
FROM gcr.io/distroless/java21-debian12
WORKDIR /usr/app

# Copia o JAR
COPY --from=build /usr/src/app/target/banco-de-dentes.jar app.jar

# Variáveis de ambiente
ENV TZ=America/Sao_Paulo
ENV SPRING_PROFILE=default
ENV PORTA=8080

EXPOSE ${PORTA}

ENTRYPOINT ["java", "-Xms512m", "-Xmx800m", "-XX:MaxMetaspaceSize=192m", "-XX:MaxDirectMemorySize=128m", "-XX:+UseG1GC", "-XX:+UseStringDeduplication", "-XX:+ExitOnOutOfMemoryError", "-XX:MaxGCPauseMillis=200", "-XX:+ExplicitGCInvokesConcurrent", "-Dspring.profiles.active=${SPRING_PROFILE}", "-jar", "/usr/app/app.jar"]