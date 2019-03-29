<template>
    <div>
    <div class="settings" @click="openHome">
        <font-awesome-icon v-if="!downloading" icon="home" class="settings-icon" />
        <font-awesome-icon v-else icon="spinner" spin class="settings-icon" />
        </div>
        <div class="status">
          <div v-if="!downloading">
            <div><p class="head">Simulator: </p>
              <p v-if="simStatus" class="success">Active</p>
              <p v-else class="state" @click="activateSim">Activate</p>
            </div>

            <div><p class="head">Evolver: </p>
              <p v-if="evolStatus" class="success">Active</p>
              <p v-else class="state" @click="activateEvol">Activate</p>
            </div>
          </div>
          <div v-else>
            <div>
              <p class="head">Status : </p>
              <p class="success">Downlading</p>
            </div>
            <div><p class="head">Note: </p>
              <p>First usage of this app will take about 5 minuites</p>
            </div>

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
      evolStatus: false,
      downloading: false
    }
  },
  methods: {
    openHome: function () {
      this.$parent.show('home')
    },
    activateEvol: function () {
      // var ls = childProcess.spawn('ls', ['-l']);

      if (!this.downloading) {
        var ls = childProcess.execFile(path.join(__static, 'scripts', 'evol', 'start.sh'))
        var self = this
        ls.stdout.on('data', function (data) {
          if (data === undefined) {
            self.validateEvol()
          } else {
            console.log('stdout: <' + data + '> ')
            if (data.indexOf(' ') > 25) {
              // Big number signifies the docker id
              self.validateEvol()
            }
          }
        })

        ls.stderr.on('data', function (data) {
          if (data.includes('is already in use by container')) {
            self.validateEvol()
          } else if (!self.checkDownload(data)) {
            alert('stderr activateEvol: ' + data)
          }
        })

        ls.on('close', function (code) {
          if (code !== 0 && code !== 125) {
            alert('activateEvol process exited with code ' + code)
          }
        })
      } else {
        console.log('activateEvol paused because of download')
      }
    },
    validateEvol: function () {
      var self = this

      if (!this.downloading) {
        var ls = childProcess.execFile(path.join(__static, 'scripts', 'evol', 'evolCheck.sh'), (error, stdout, stderr) => {
          if (error) {
          // throw error
            console.log(error)
          // do nothing
          }
          if (stdout.includes('good')) {
            self.evolStatus = true
          }
        })

        ls.stdout.on('data', function (data) {
          if (data.includes('good')) {
            self.evolStatus = true
          }
        })

        ls.stderr.on('data', function (data) {
        //
          self.evolStatus = false
          if (data.includes('No such container: robogen') || data.includes('is not running')) {
            self.activateEvol()
          } else if (!self.checkDownload(data)) {
            alert('stderr validateEvol: ' + data)
          }
        })

        ls.on('close', function (code) {
          if (!(code === 0 || code === 1 || code === 126)) {
            alert('validateEvol process exited with code ' + code)
          }
        })
      }
    },

    activateSim: function () {
      if (!this.downloading) {
        var ls = childProcess.execFile(path.join(__static, 'scripts', 'sim', 'start.sh'))

        var self = this
        ls.stdout.on('data', function (data) {
          console.log('stdout: <' + data + '> ')
          if (data.indexOf(' ') > 25) {
            // Big number signifies the docker id
            self.validateSim()
          }
        })

        ls.stderr.on('data', function (data) {
          if (data.includes('is already in use by container')) {
            self.validateSim()
          } else if (data.includes('Bad substitution')) {
            self.validateSim()
          } else if (data.includes('chromium')) {
            self.validateSim()
          } else if (!self.checkDownload(data)) {
            alert('stderr activateSim: ' + data)
          }
        })

        ls.on('close', function (code) {
          if (!(code === 0 || code === 125)) {
            alert('activatesim process exited with code ' + code)
          }
          self.validateSim()
        // if (code == 0) { setStatus('child process complete.') } else { setStatus('child process exited with code ' + code) }
        // getDroidOutput().style.background = 'DarkGray'
        })
      } else {
        console.log('activateSim paused for download')
      }
    },
    validateSim: function () {
      var self = this
      if (!this.downloading) {
        var ls = childProcess.execFile(path.join(__static, 'scripts', 'sim', 'simCheck.sh'), (error, stdout, stderr) => {
          if (error) {
          // throw error
          // do nothing
          }
          if (stdout.includes('good')) {
            self.simStatus = true
          }
        })
        // console.dir(ls)
        ls.stdout.on('data', function (data) {
          if (data.includes('good')) {
            self.simStatus = true
          }
        })

        ls.stderr.on('data', function (data) {
          self.simStatus = false
          if (data.includes('No such container: robogen')) {
          // alert('Restart sim container')
            self.activateSim()
          } else if (!self.checkDownload(data)) {
            alert('stderr validateSim: ' + data)
          }
        }
        )

        ls.on('close', function (code) {
        // alert('child process exited with code ' + code)
          if (!(code === 0 || code === 1)) {
            alert('validateSim process exited with code ' + code)
          }
        })
      }
    },
    checkDownload: function (data) {
      console.log(data)
      if (data.includes('Pulling') || data.includes('Waiting') || data.includes(' Already exists') || data.includes('Unable to find image') || data.includes('Verifying Checksum') || data.includes('start.sh')) {
        this.downloading = true
        return true
      } else if (data.includes('Downloaded newer image') || data.includes('Image is up to date')) {
        this.downloading = false
        this.validate()
        return true
      }
      return this.downloading
    },
    validate: function () {
      // Validation may take longer than expected time
      // Do not validate if evolution is in progress
      if (!this.downloading) {
        // do validation only on successful image
        this.validateSim()
        this.validateEvol()
      }
    },
    execute: function () {}
  },
  mounted () {
    this.validate()
    setTimeout(this.validate, 5000)
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

