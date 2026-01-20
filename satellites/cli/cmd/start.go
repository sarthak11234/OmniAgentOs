package cmd

import (
	"omni-cli/client"

	"github.com/spf13/cobra"
)

var startCmd = &cobra.Command{
	Use:   "start",
	Short: "Start satellite mode (streaming)",
	Run: func(cmd *cobra.Command, args []string) {
		client.StartStream("satellite-cli")
	},
}

func init() {
	rootCmd.AddCommand(startCmd)
}
