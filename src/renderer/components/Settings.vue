<template>
    <div>
    <div class="settings" @click="openHome">
          <font-awesome-icon icon="home" class="settings-icon" />
        </div>
        <div class="status">
            <div><p class="head">Simulator: </p>
              <p v-if="simStatus" class="success">Active</p>
              <p v-else class="state" @click="activateSim">Activate</p>
            </div>

            <div><p class="head">Evolver: </p>
              <p v-if="evolStatus" class="success">Active</p>
              <p v-else class="state" @click="activateEvol">Activate</p>
            </div>
          </div>
          </div>
</template>

<script>
const process = require('child_process') // The power of Node.JS
export default {
  data () {
    return {
      name: 'NewRobot',
      simStatus: false,
      evolStatus: false
    }
  },
  methods: {
    openHome: function () {
      this.$parent.show('home')
    },
    activateEvol: function () {
      // var ls = process.spawn('ls', ['-l']);
      var ls = process.spawn('./scripts/evol/start.sh')
      var self = this
      ls.stdout.on('data', function (data) {
        console.log('stdout: <' + data + '> ')
      })

      ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data)
        if (data.includes('is already in use by container')) {
          self.validateEvol()
        }
      })

      ls.on('close', function (code) {
        console.log('child process exited with code ' + code)
        // if (code == 0) { setStatus('child process complete.') } else { setStatus('child process exited with code ' + code) }
        // getDroidOutput().style.background = 'DarkGray'
      })
    },
    validateEvol: function () {
      var self = this
      var ls = process.spawn('./scripts/evol/evolCheck.sh')

      ls.stdout.on('data', function (data) {
        if (data.includes('good')) {
          self.evolStatus = true
        }
      })

      ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data)
        self.evolStatus = false
        if (data.includes('No such container: robogen')) {
          self.activateEvol()
        }
      })

      ls.on('close', function (code) {
        // console.log('child process exited with code ' + code)
        if (code !== 0) {
          console.log('child process exited with code ' + code)
        }
        // getDroidOutput().style.background = 'DarkGray'
      })
    },

    activateSim: function () {
      // var ls = process.spawn('ls', ['-l']);
      var ls = process.spawn('./scripts/sim/start.sh')
      var self = this
      ls.stdout.on('data', function (data) {
        console.log('stdout: <' + data + '> ')
      })

      ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data)
        if (data.includes('is already in use by container')) {
          self.validateSim()
        }
      })

      ls.on('close', function (code) {
        console.log('child process exited with code ' + code)
        self.validateSim()
        // if (code == 0) { setStatus('child process complete.') } else { setStatus('child process exited with code ' + code) }
        // getDroidOutput().style.background = 'DarkGray'
      })
    },
    validateSim: function () {
      var self = this
      var ls = process.spawn('./scripts/sim/simCheck.sh')

      ls.stdout.on('data', function (data) {
        if (data.includes('good')) {
          self.simStatus = true
        }
      })

      ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data)
        self.simStatus = false
      })

      ls.on('close', function (code) {
        // console.log('child process exited with code ' + code)
        if (code !== 0) {
          console.log('child process exited with code ' + code)
        }
        // getDroidOutput().style.background = 'DarkGray'
      })
    },
    validate: function () {
      // Validation may take longer than expected time
      // Do not validate if evolution is in progress
      this.validateSim()
      this.validateEvol()
      setTimeout(this.validate, 5000)
    },
    execute: function () {}
  },
  mounted () {
    this.validate()
  }
}
</script>


<style>
.settings {
  float: right;
  background: rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 5px 1px rgba(0, 0, 0, 0.3);
  border-radius: 7px;
  margin-bottom: 10px;
  padding: 5px;
}

.settings-icon {
  font-size: 30px;
  margin: 5px;
  cursor: pointer;
}

.status {
  float: right;
  text-align: right;
  padding: 5px;
  padding-right: 10px;
}

.status p {
  font-size: 18px;
  display: inline-block;
}
.status .head {
  font-size: 18px;
  display: inline-block;
  font-weight: 700;
  padding-right: 5px;
}

.status div {
  margin-bottom: -20px;
  margin-top: -5px;
}

.state {
  cursor: pointer;
  text-decoration: underline;
}

.success {
  color: green;
  font-weight: bold;
}
</style>

