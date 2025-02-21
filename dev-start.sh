#!/bin/bash

# Port number to be killed
FRONTEND_PORT=3335
BACKEND_PORT=3000
# Kill processes using the specified port
kill -9 $(lsof -i:$FRONTEND_PORT -t) 2> /dev/null
kill -9 $(lsof -i:$BACKEND_PORT -t) 2> /dev/null
# Check if the kill command was successful
if [ $? -eq 0 ]; then
  echo "Processes using port $FRONTEND_PORT,$BACKEND_PORT have been killed."
else
  echo "No processes were found using port $FRONTEND_PORT,$BACKEND_PORT or failed to kill them."
fi
# Run the nx command
nx run-many --target=build --projects=schemas,dtos,utilities
nx run-many --target=serve --all --maxParallel=100

# Check if the nx command was successful
if [ $? -eq 0 ]; then
  echo "nx run-many command executed successfully."
else
  echo "Failed to execute nx run-many command."
fi
