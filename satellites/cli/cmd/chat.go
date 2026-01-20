package cmd

import (
	"fmt"
	"omni-cli/client"
	"strings"

	"github.com/spf13/cobra"
)

var chatCmd = &cobra.Command{
	Use:   "chat [query]",
	Short: "Send a query to the Cortex Brain",
	Args:  cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		query := strings.Join(args, " ")
		fmt.Printf("🤖 Sending query: %s\n", query)

		resp, err := client.Query(query)
		if err != nil {
			fmt.Printf("❌ Error: %v\n", err)
			return
		}

		fmt.Printf("\n📝 Answer:\n%s\n", resp.Answer)
		if resp.ContextUsed != "" {
			fmt.Printf("\n📚 Context Used:\n%s\n", resp.ContextUsed)
		}
	},
}

func init() {
	rootCmd.AddCommand(chatCmd)
}
