package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Authenticate with the Cortex Brain",
	Run: func(cmd *cobra.Command, args []string) {
		// MVP: In a real app, this would open a browser or prompt for credentials
		// and exchange them for a JWT from the backend.
		// For now, we simulate success and store a dummy token.

		fmt.Println("🔐 Authenticating...")

		// TODO: Implement actual auth flow against backend/auth/token
		fakeToken := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SIMULATED_TOKEN"

		viper.Set("auth.token", fakeToken)
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
