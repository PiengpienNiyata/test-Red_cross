#!/bin/bash

VERSION="latest"

while getopts "v:" opt; do
  case $opt in
    v)
      VERSION=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

GOOS=linux GOARCH=amd64 go build -o backend main.go
docker build --platform linux/amd64 -t trueeye.azurecr.io/researcher_form_backend:$VERSION -f Dockerfile .
docker tag trueeye.azurecr.io/researcher_form_backend:$VERSION trueeye.azurecr.io/researcher_form_backend:test
docker tag trueeye.azurecr.io/researcher_form_backend:$VERSION trueeye.azurecr.io/researcher_form_backend:latest