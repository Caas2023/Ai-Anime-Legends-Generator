Set WshShell = CreateObject("WScript.Shell")
batPath = "d:\projetos antigravity\Anime Photo Transformer\run_project.bat"
WshShell.Run chr(34) & batPath & chr(34), 1, False
