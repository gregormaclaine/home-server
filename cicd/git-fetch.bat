@echo off
cd C:\Projects\GServer\%1
git fetch
git log HEAD..origin/master --oneline