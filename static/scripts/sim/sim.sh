echo test
docker exec robogen_sim /bin/bash -c "./robogen-file-viewer ../Exercises/$1 ../Exercises/$2 --pause --seed $3"
