package cmd

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Manage configuration",
}

var setCmd = &cobra.Command{
	Use:   "set [key] [value]",
	Short: "Set a configuration value",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		key := args[0]
		value := args[1]

		viper.Set(key, value)
		err := viper.WriteConfig()
		if err != nil {
			// If config file doesn't exist, create it
			if _, ok := err.(viper.ConfigFileNotFoundError); ok || strings.Contains(err.Error(), "Not Found") {
				err = viper.SafeWriteConfig()
			}
		}

		if err != nil {
			fmt.Printf("❌ Failed to save config: %v\n", err)
			return
		}

		fmt.Printf("✅ Set %s = %s\n", key, value)
	},
}

var getCmd = &cobra.Command{
	Use:   "get [key]",
	Short: "Get a configuration value",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		key := args[0]
		val := viper.Get(key)
		if val == nil {
			fmt.Printf("%s is not set\n", key)
			return
		}
		fmt.Printf("%s: %v\n", key, val)
	},
}

func init() {
	configCmd.AddCommand(setCmd)
	configCmd.AddCommand(getCmd)
	rootCmd.AddCommand(configCmd)
}
