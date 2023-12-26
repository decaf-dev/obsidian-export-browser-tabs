```mermaid
---
title: Export into single note
---
flowchart TD
    Start --> A
	A[Create save folder] --> B[Get tabs using AppleScript]
	B --> one
	subgraph one [for each tab]
	C[Create markdown link] --> D[Add link to file data buffer]
	end
	D --> F[Create file with data buffer]
	F --> G[Push success notification]
```
