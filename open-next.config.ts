import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
	incrementalCache: async () => ({
		name: "dummy",
		get: async () => null,
		set: async () => {},
		delete: async () => {},
	}),
});
