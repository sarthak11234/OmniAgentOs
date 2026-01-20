package cmd

import (
	"fmt"
	"net/http"
	"time"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Check connection to Cortex Brain",
	Run: func(cmd *cobra.Command, args []string) {
		serverURL := viper.GetString("server")
		if serverURL == "" {
			serverURL = "http://localhost:8000"
		}

		timeout := time.Duration(2 * time.Second)
		httpClient := http.Client{
			Timeout: timeout,
		}
		_, err := httpClient.Get(serverURL + "/api/health")
		if err != nil {
			fmt.Printf("🔴 Offline (Cannot reach %s)\n", serverURL)
			return
		}
		fmt.Printf("🟢 Online (Connected to %s)\n", serverURL)
	},
}

func init() {
	rootCmd.AddCommand(statusCmd)
}
