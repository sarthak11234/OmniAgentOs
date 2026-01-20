package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var ctxCmd = &cobra.Command{
	Use:   "ctx",
	Short: "Manage context",
}

var addCmd = &cobra.Command{
	Use:   "add [file]",
	Short: "Add a file to the Cortex context",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		filePath := args[0]

		// 1. Read File
		content, err := ioutil.ReadFile(filePath)
		if err != nil {
			fmt.Printf("❌ Failed to read file: %v\n", err)
			return
		}

		// 2. Prepare Request
		filename := filepath.Base(filePath)
		payload := map[string]string{
			"filename": filename,
			"content":  string(content),
			"type":     "file",
		}

		jsonData, err := json.Marshal(payload)
		if err != nil {
			fmt.Printf("❌ JSON Error: %v\n", err)
			return
		}

		serverURL := viper.GetString("server")
		if serverURL == "" {
			serverURL = "http://localhost:8000"
		}

		token := viper.GetString("auth.token")

		req, err := http.NewRequest("POST", serverURL+"/api/context/add", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Printf("❌ Request Error: %v\n", err)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}

		// 3. Send to Backend
		httpClient := &http.Client{}
		resp, err := httpClient.Do(req)
		if err != nil {
			fmt.Printf("❌ Network Error: %v\n", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != 200 {
			fmt.Printf("❌ failed to upload context (Status: %d)\n", resp.StatusCode)
			return
		}

		fmt.Printf("✅ Successfully added %s to context!\n", filename)
	},
}

func init() {
	ctxCmd.AddCommand(addCmd)
	rootCmd.AddCommand(ctxCmd)
}
