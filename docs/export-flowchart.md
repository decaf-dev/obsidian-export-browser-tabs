## Export (local)

```mermaid
---
title: Export browser tabs command
---
flowchart TD
    Start --> A
	A[Create save folder] --> B[Get tabs using AppleScript]
	B --> one
	subgraph one[for each tab]
	C{Check if url already exists} --> D{Check if excluded}
	D --> E[Remove invalid characters for file system]
	E --> F["Remove notification count '(1)'"]
	F --> G[Trim to 255 characters]
	G --> H[Get frontmatter for file]
	H --> I["Create file with frontmatter data<br/>a name collision becomes '&lt;title&gt; (Duplicate N)'"]

	end
	one --> Summary["Summary: exported, renamed, failed"]
```

## Export (remote)

The remote export talks to a browser on a connected Android device over ADB and the
Chrome DevTools Protocol. Each step is its own checked subprocess, so a failure can
say which stage broke and what to do about it.

```mermaid
---
title: Export browser tabs (remote) command
---
flowchart TD
	Start --> V{"Validate ADB path<br/>(absolute, exists, executable)"}
	V -- invalid --> Err[Show what to fix]
	V -- ok --> D{"adb devices -l"}
	D -- "none / unauthorized / offline / multiple" --> Err
	D -- one device --> S["adb shell cat /proc/net/unix<br/>discover DevTools sockets"]
	S -- unreadable --> Fallback[Fall back to chrome_devtools_remote]
	S -- "none listening" --> Err
	S -- "no match, several candidates" --> Err
	Fallback --> F
	S -- matched --> F["adb forward tcp:0<br/>adb picks a free port"]
	F -- failed --> Err
	F --> H["GET 127.0.0.1:port/json/list"]
	H -- "refused / timeout / bad status / bad JSON" --> Cleanup
	H --> P["Keep type=page targets with http(s) urls<br/>then deduplicate"]
	P --> one
	subgraph one[for each tab]
	C{Check if excluded} --> D2{Check if url already in vault}
	D2 --> E[Decode HTML entities]
	E --> E2[Remove invalid characters for file system]
	E2 --> G["Remove notification count '(1)'"]
	G --> G2[Trim to 255 characters]
	G2 --> I["Create file<br/>a name collision becomes '&lt;title&gt; (Duplicate N)'"]
	end
	one --> Summary["Summary: exported, skipped, renamed, failed"]
	Summary --> Cleanup["adb forward --remove<br/>always runs"]
	Err --> Done
	Cleanup --> Done([Done])
```

A per-tab failure is counted and the export continues, so one bad tab cannot lose the
rest of the run.
