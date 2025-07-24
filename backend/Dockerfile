# Build the application from source
FROM golang:1.24 AS build-stage

WORKDIR /app

COPY . /app/

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o backend main.go

FROM alpine:3.21 AS build-release-stage

RUN apk update && apk add bash && apk --no-cache add tzdata

WORKDIR /

COPY --from=build-stage /app/backend /backend

EXPOSE 8080

CMD ["./backend"]
