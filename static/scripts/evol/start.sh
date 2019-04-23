# PWD=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
SRC_DIR=~/Robogen/Exercises
echo $SRC_DIR
xhost +
docker run -it -d --user $(id -u):$(id -g) --rm \
	--name robogen1_evo \
	--expose=49152 \
	-v ${SRC_DIR}:/robogen/Exercises:rw \
    -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
	robogen/robogen_app:1.3 /bin/bash -c "./robogen-server 49152"
