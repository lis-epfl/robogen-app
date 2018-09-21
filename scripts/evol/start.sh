PWD=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
SRC_DIR=$PWD/examples
echo $SRC_DIR
xhost +
docker run -it -d --rm --privileged \
	--name robogen1_evol \
	--expose=49152 \
	--mount type=bind,source="${SRC_DIR}",target=/robogen/examples,bind-propagation=rshared \
    -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
	robogen:1.2 /bin/bash -c "./robogen-server 49152"
