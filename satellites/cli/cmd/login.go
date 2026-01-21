package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Authenticate with the Cortex Brain",
	Run: func(cmd *cobra.Command, args []string) {
		serverURL := viper.GetString("server")
		if serverURL == "" {
			serverURL = "http://localhost:8000"
		}

		fmt.Printf("🔐 Authenticating with %s...\n", serverURL)

		// 1. Prepare Request
		// In a real CLI, we might prompt for a password or use an API key
		// For this MVP, we send the default 'omni123' expected by the backend
		jsonData := []byte(`{"password":"omni123"}`)

		req, err := http.NewRequest("POST", serverURL+"/api/auth/login", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Printf("❌ Request Creation Error: %v\n", err)
			return
		}
		req.Header.Set("Content-Type", "application/json")

		// 2. Execute Request
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			fmt.Printf("❌ Network Error: %v\n", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != 200 {
			fmt.Printf("❌ Login Failed (Status: %d)\n", resp.StatusCode)
			return
		}

		// 3. Parse Response
		body, _ := ioutil.ReadAll(resp.Body)
		var result map[string]string
		if err := json.Unmarshal(body, &result); err != nil {
			fmt.Printf("❌ JSON Error: %v\n", err)
			return
		}

		token := result["token"]
		if token == "" {
			fmt.Println("❌ Received empty token from server.")
			return
		}

		// 4. Save Token
		viper.Set("auth.token", token)
		if err := viper.WriteConfig(); err != nil {
			viper.SafeWriteConfig()
		}

		fmt.Println("✅ Successfully logged in!")
		fmt.Println("Token stored in config.")
	},
}

func init() {
	rootCmd.AddCommand(loginCmd)
}
