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
import path from 'path'
const childProcess = require('child_process') // The power of Node.JS
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
      // var ls = childProcess.spawn('ls', ['-l']);
      var ls = childProcess.execFile(path.join(__static, 'scripts', 'evol', 'start.sh'))
      var self = this
      ls.stdout.on('data', function (data) {
        console.log('stdout: <' + data + '> ')
      })

      ls.stderr.on('data', function (data) {
        if (data.includes('is already in use by container')) {
          self.validateEvol()
        } else {
          alert('stderr activateEvol: ' + data)
        }
      })

      ls.on('close', function (code) {
        if (code !== 0 && code !== 125) {
          alert('activateEvol process exited with code ' + code)
        }
      })
    },
    validateEvol: function () {
      var self = this
      var ls = childProcess.execFile(path.join(__static, 'scripts', 'evol', 'evolCheck.sh'))

      ls.stdout.on('data', function (data) {
        if (data.includes('good')) {
          self.evolStatus = true
        }
      })

      ls.stderr.on('data', function (data) {
        //
        self.evolStatus = false
        if (data.includes('No such container: robogen')) {
          // alert('Restart Evolve')
          self.activateEvol()
        } else {
          alert('stderr validateEvol: ' + data)
        }
      })

      ls.on('close', function (code) {
        if (code !== 0 && code !== 1 && code < 128) {
          alert('validateEvol process exited with code ' + code)
        }
      })
    },

    activateSim: function () {
      var ls = childProcess.execFile(path.join(__static, 'scripts', 'sim', 'start.sh'))
      var self = this
      ls.stdout.on('data', function (data) {
        console.log('stdout: <' + data + '> ')
      })

      ls.stderr.on('data', function (data) {
        alert('stderr activateSim: ' + data)
        if (data.includes('is already in use by container')) {
          self.validateSim()
        }
      })

      ls.on('close', function (code) {
        if (code !== 0) {
          alert('activatesim process exited with code ' + code)
        }
        self.validateSim()
        // if (code == 0) { setStatus('child process complete.') } else { setStatus('child process exited with code ' + code) }
        // getDroidOutput().style.background = 'DarkGray'
      })
    },
    validateSim: function () {
      var self = this

      var ls = childProcess.execFile(path.join(__static, 'scripts', 'sim', 'simCheck.sh'))

      ls.stdout.on('data', function (data) {
        if (data.includes('good')) {
          self.simStatus = true
        }
      })

      ls.stderr.on('data', function (data) {
        alert('stderr validateSim: ' + data)
        self.simStatus = false
      })

      ls.on('close', function (code) {
        // alert('child process exited with code ' + code)
        if (code !== 0) {
          alert('validateSim process exited with code ' + code)
        }
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
  created () {
    this.validate()
    var self = this
    Event.$on('updateFiles', function () {
      self.validateEvol()
    })
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

