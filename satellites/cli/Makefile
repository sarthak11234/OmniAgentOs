BINARY_NAME=omni-cli
VERSION=0.1.0
BUILD_DIR=build

.PHONY: all clean build build-all

all: clean build

build:
	go build -o $(BUILD_DIR)/$(BINARY_NAME) main.go

build-all: clean
	# Windows
	GOOS=windows GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe main.go
	# Linux
	GOOS=linux GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 main.go
	# macOS
	GOOS=darwin GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 main.go
	GOOS=darwin GOARCH=arm64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 main.go

clean:
	rm -rf $(BUILD_DIR)

deps:
	go mod tidy
