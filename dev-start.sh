#!/bin/bash

# Port number to be killed
PORT=3335

# Kill processes using the specified port
kill -9 $(lsof -i:$PORT -t) 2> /dev/null

# Check if the kill command was successful
if [ $? -eq 0 ]; then
  echo "Processes using port $PORT have been killed."
else
  echo "No processes were found using port $PORT or failed to kill them."
fi

# Run the nx command
nx run-many --target=serve --all --maxParallel=100

# Check if the nx command was successful
if [ $? -eq 0 ]; then
  echo "nx run-many command executed successfully."
else
  echo "Failed to execute nx run-many command."
fi
