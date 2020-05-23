#!/bin/bash
set -e

stop() {
	echo "Stopping '$1'..."
	pid=`ps -ef | grep "$1" | grep -v grep | awk '{print $2}'`
  if [[ -n "$pid" ]]; then
    echo "Killing $1 with pid $pid";
    kill -9 ${pid}
  fi
}

cleanup() {
    echo "cleaning up"
    stop "nodemon app.js"
    stop "node app.js"
}

trap cleanup ERR
trap cleanup 0

drop_db=$1

psql -U postgres -h localhost -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = 'trivia_ninja_dev'"
case ${drop_db} in
    -d|--drop)
        echo "Dropping db.."
        dropdb -U postgres -h localhost --if-exists trivia_ninja_dev
        echo "Creating db.."
        createdb -U postgres -h localhost trivia_ninja_dev
    ;;
esac
echo "Applying migrations.."
NODE_ENV=dev $(npm bin)/knex --migrations-directory ./db/migrations/ migrate:latest
npm run dev
