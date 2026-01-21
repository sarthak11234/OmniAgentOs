package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"

	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
	"github.com/spf13/viper"
)

type QueryRequest struct {
	Query  string `json:"query"`
	Limit  int    `json:"limit"`
	Stream bool   `json:"stream"`
}

type QueryResponse struct {
	Answer      string `json:"answer"`
	ContextUsed string `json:"context_used"`
}

func getServerURL() string {
	url := viper.GetString("server")
	if url == "" {
		return "http://localhost:8000"
	}
	return url
}

func getAuthHeader() string {
	token := viper.GetString("auth.token")
	if token != "" {
		return "Bearer " + token
	}
	return ""
}

// REST Client for querying (synchronous)
func Query(text string) (*QueryResponse, error) {
	serverURL := getServerURL()
	reqBody := QueryRequest{
		Query:  text,
		Limit:  5,
		Stream: false,
	}
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", serverURL+"/api/query", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if auth := getAuthHeader(); auth != "" {
		req.Header.Set("Authorization", auth)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Debugging Logs
	fmt.Printf("DEBUG: Status Code: %d\n", resp.StatusCode)

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}

	bodyBytes, _ := ioutil.ReadAll(resp.Body)
	// Restore the io.ReadCloser to its original state
	resp.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

	fmt.Printf("DEBUG: Response Body: %s\n", string(bodyBytes))

	var result QueryResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		fmt.Printf("DEBUG: JSON Decode Error: %v\n", err)
		return nil, err
	}

	return &result, nil
}

// WebSocket Client for streaming (satellite mode)
func StartStream(satelliteName string) {
	serverURL := getServerURL()
	// Convert http(s) to ws(s)
	wsURL := ""
	if len(serverURL) > 4 && serverURL[:5] == "https" {
		wsURL = "wss" + serverURL[5:]
	} else {
		wsURL = "ws" + serverURL[4:]
	}
	wsURL += "/ws/stream"

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	log.Printf("Connecting to %s...", wsURL)

	header := http.Header{}
	if auth := getAuthHeader(); auth != "" {
		header.Set("Authorization", auth)
	}

	c, _, err := websocket.DefaultDialer.Dial(wsURL, header)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	done := make(chan struct{})

	go func() {
		defer close(done)
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				return
			}
			log.Printf("recv: %s", message)
		}
	}()

	ticker := time.NewTicker(time.Second * 5)
	defer ticker.Stop()

	// Initial handshake
	handshake := map[string]interface{}{
		"type":   "handshake",
		"source": satelliteName,
	}
	if err := c.WriteJSON(handshake); err != nil {
		log.Println("handshake error:", err)
		return
	}

	log.Println("✅ Connected to Cortex Brain! Processing stream...")

	for {
		select {
		case <-done:
			return
		case t := <-ticker.C:
			// Heartbeat
			err := c.WriteMessage(websocket.PingMessage, []byte(t.String()))
			if err != nil {
				log.Println("write:", err)
				return
			}
		case <-interrupt:
			log.Println("interrupt")
			// Cleanly close the connection by sending a CloseMessage
			err := c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("write close:", err)
				return
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			return
		}
	}
}
