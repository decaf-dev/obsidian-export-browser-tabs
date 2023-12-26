```mermaid
---
title: Export into single note
---
flowchart TD
    Start --> A
	A[Create save folder] --> B[Get tabs using AppleScript]
	B --> C[Iterate over tabs]
	C --> one
	subgraph one
	E[Create markdown link] --> F[Append link to file data]
	end
	F --> G[Create file with data]
	G --> H[Push success notification]
```
