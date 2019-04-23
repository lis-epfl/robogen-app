#!/bin/bash
docker exec robogen_sim /bin/bash -c "python ../python/json_converter.py ../Exercises/$1 ../Exercises/$2"