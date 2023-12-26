```mermaid
---
title: Export into single note
---
flowchart TD
    Start --> A
	A[Create save folder] --> B[Get tabs using AppleScript]
	B --> C[Iterate over tabs]
	C --> D[Create markdown link for each tab]
	D --> E[Export links in a single file]
	E --> F[Push notification]
```
