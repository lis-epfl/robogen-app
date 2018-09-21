<template>
  <form class="vue-form" @submit.prevent="submit">
    <fieldset>
      <div class="row">
          <div class="col-sm-8" style="padding:0"> <legend style="border:0;margin:0">Simulation Configuration <legend style="font-size:16px">{{name}}.sim.txt <span v-if="!saved" style="cursor:pointer; text-decoration:underline; color:blue" @click="save_sim_file">Save</span></legend></legend></div>
          <div class="col-sm-4" style="padding:0"><input type="button" value="Load File" @click="open_file"></div>
      </div>
      <div class="row">
        <div class="col-sm-6">
            <label class="label" for="robot">Robot File (Required)</label>
            <file-select v-model="robotFile" :accept="[{'name': 'Robogen Robot File', 'ext' :'robot.txt'}]" :defaultPath="projectFolderPath" ref="robotFile"></file-select>
            <!-- <input type="file" name="robot" id="robot" required="" accept=".robot.text"> -->
        </div>
        <div class="col-sm-6">
            <label class="label" for="ff">Fitness Function (Required) </label>
            <file-select v-model="scenarioFile" :accept="[{'name': 'Robogen Scenario File', 'ext' :'js'}]" :defaultPath="projectFolderPath" ref="scenarioFile"></file-select>
        </div>
      </div>
      <div class="row">
              <div class="col-sm-6">
                  <label class="label" for="st">Simulation Time (s) </label>
                  <input type="number" name="st" id="st" required="" v-model="simulationTime">
              </div>
              <div class="col-sm-6">
                  <label class="label" for="ff">Time Step</label>
                  <input type="number" name="ff" id="ff" required="" v-model="timeStep">   
              </div>
      </div>

      <div class="row">
              <div class="col-sm-6">
                  <label class="label" for="tf">Terrain Friction </label>
                  <input type="number" name="tf" id="tf" required="" v-model="terrainFriction">
              </div>
              <div class="col-sm-6">
                  <label class="label" for="gra">Gravity (m/s^2)</label>
                  <input type="text" name="gra" id="gra" required="" v-model="gravity">   
              </div>
      </div>

      <div class="row">
          <div class="col-sm-12">
          <label class="label" for="textarea">Other Parameters</label>
          <textarea  name="textarea" id="textarea" v-model="other"></textarea>
          </div>
      </div>

      

      <div class="row">
        <div class="debug-simulate">
            <pre><code>{{ simConfig }}</code></pre>
        </div>
      </div>

      <div class="row">
        <input type="submit" value="Save" :disabled="!isValid" @click="save_sim_file">
        <div style="position:absolute; right:70px" >
        <input type="button" value="Test Me" :disabled="!isValid" @click="testSim" >
        </div>
      </div>
    </fieldset>
  </form>
</template>
<script>
import FileSelect from './Helper/FileSelect.vue'
var app = require('electron').remote
var dialog = app.dialog
var fs = require('fs') // Load the File System to execute our common tasks (CRUD)
const process = require('child_process') // The power of Node.JS
export default {
  props: {
    mainFolderPath: {
      type: String
    },
    projectFolderPath: {
      type: String
    },
    simFiles: {
      type: Array
    },
    robotFiles: {
      type: Array
    }
  },
  components: {
    FileSelect
  },
  data: function () {
    return {
      simulationTime: 8,
      timeStep: 0.005,
      terrainFriction: 1.0,
      gravity: 9.8,
      actuationFrequency: 25,
      other: '',
      scenarioFile: '',
      simFilePath: '',
      robotFile: '',
      content: '',
      saved: false,
      name: '',
      localProjectFolderPath: this.projectFolderPath,
      localSimFiles: this.simFiles,
      localRobotFiles: this.robotFiles,
      localMainFolerPath: this.mainFolderPath
    }
  },
  methods: {
    // Load file
    open_file: function () {
      dialog.showOpenDialog({
        filters: [
          { name: 'Robogen Simulation File', extensions: ['sim.txt'] }
        ],
        defaultPath: this.projectFolderPath
      }, (fileNames) => {
        // fileNames is an array that contains all the selected
        if (fileNames === undefined) {
          console.log('No file selected')
          return
        }
        this.load_sim_file(fileNames[0])
      })
    },
    load_sim_file: function (fileName) {
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the file :' + err.message)
          return
        }
        this.name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.indexOf('.'))
        var params = data.split('\n')
        this.other = ''

        for (var i = 0; i < params.length; i++) {
          var param = params[i]
          if (param.indexOf('#') > -1) {
            // Remove all comments
            param = param.substring(0, param.indexOf('#'))
          }
          // Remove all spaces
          param = param.split(' ').join('')
          if (param.length > 0) {
            this.updateData(param)
          }
        }
      })
      this.saved = true
      if (this.robotFiles.length === 1) {
        this.robotFile = this.projectFolderPath + '/' + this.robotFiles[0]
        this.$refs.robotFile.updateFilePath(this.robotFile)
      }
    },
    updateData: function (param) {
      if (param.includes('simulationTime=')) {
        this.simulationTime = param.substring('simulationTime='.length)
      } else if (param.includes('timeStep=')) {
        this.timeStep = param.substring('timeStep='.length)
      } else if (param.includes('terrainFriction=')) {
        this.terrainFriction = param.substring('terrainFriction='.length)
      } else if (param.includes('gravity=')) {
        this.gravity = param.substring('gravity='.length)
      } else if (param.includes('scenario=')) {
        this.scenarioFile = param.substring('scenario='.length)
        this.$refs.scenarioFile.updateFilePath(this.projectFolderPath + '/' + this.scenarioFile)
      } else if (param.includes('terrainType=') || param.includes('terrainLength=') || param.includes('terrainWidth=') || param.includes('actuationFrequency=')) {
        // Do nothing
      } else {
        this.other += param + '\n'
      }
    },
    save_sim_file: function () {
      var self = this
      // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
      dialog.showSaveDialog({
        defaultPath: this.projectFolderPath + '/' + this.name + '.sim.txt',
        filters: [
          { name: 'Robogen Sim File', extensions: ['sim.txt'] }
        ]}, (fileName) => {
        if (fileName === undefined) {
          console.log("You didn't save the file")
          return
        }

        // fileName is a string that contains the path and filename created in the save file dialog.
        fs.writeFile(fileName, self.content, (err) => {
          if (err) {
            alert('An error ocurred creating the file ' + err.message)
          }
          this.simFilePath = fileName
          this.saved = true
        })
      })
    },
    testSim: function () {
      var self = this
      if (this.saved) {
        var file = self.simFilePath.substring(self.simFilePath.indexOf(this.mainFolderPath) + this.mainFolderPath.length + 1, self.simFilePath.length)
        var robFile = self.robotFile.substring(self.robotFile.indexOf(this.mainFolderPath) + this.mainFolderPath.length + 1, self.robotFile.length)
        console.log('Files:')
        console.log(file)
        console.log(robFile)
        var ls = process.spawn('./scripts/sim/sim.sh', [robFile, file])

        ls.stdout.on('data', function (data) {
          console.log('stdout: <' + data + '> ')
        })

        ls.stderr.on('data', function (data) {
          console.log('stderr: ' + data)
        })

        ls.on('close', function (code) {
          console.log('child process exited with code ' + code)
          // if (code == 0) { setStatus('child process complete.') } else { setStatus('child process exited with code ' + code) }
          // getDroidOutput().style.background = 'DarkGray'
        })
      } else {
        self.save_sim_file()
        if (self.saved) {
          self.testSim()
        }
      }
    },
    getFileName: function (filePath) {
      return filePath.substring(filePath.lastIndexOf('/') + 1)
    }
  },
  computed: {
    simConfig: function () {
      this.saved = false
      this.content = '#Fitness Function\n'
      this.content += 'scenario=' + this.getFileName(this.scenarioFile) + '\n'
      this.content += '\n#Time Parameters \n'
      this.content += 'simulationTime=' + this.simulationTime + '\n'
      this.content += 'timeStep=' + this.timeStep + '\n'
      this.content += 'actuationFrequency=' + this.actuationFrequency + '\n'
      this.content += '\n#Terrain Parameters\n'
      this.content += 'terrainType=flat' + '\n' + 'terrainLength=10' + '\n' + 'terrainWidth=10' + '\n'
      this.content += 'terrainFriction=' + this.terrainFriction + '\n'
      this.content += '\n#Other Parameters\n'
      // this.content += 'sensorNoiseLevel=0.0' + '\n' + 'motorNoiseLevel=0.0' + '\n' + 'capAcceleration=false' + '\n'
      this.content += this.other
      this.saved = false
      console.log('modified')
      return this.content
    },
    isValid: function () {
      if (this.scenarioFile !== '' && this.robotFile !== '') {
        return true
      }
      return false
    },
    update: function () {
      if (this.simFiles.length > 0) {
        this.load_sim_file(this.projectFolderPath + '/' + this.simFiles[0])
        console.log(this.mainFolderPath)
      } else {
        this.$data = {
          simulationTime: 8,
          timeStep: 0.005,
          terrainFriction: 1.0,
          gravity: 9.8,
          actuationFrequency: 25,
          other: '',
          scenarioFile: '',
          robotFile: '',
          content: '',
          saved: false,
          filepath: '',
          name: '',
          localProjectFolderPath: this.projectFolderPath,
          localSimFiles: this.simFiles
        }
      }
      this.saved = true
    }
  },
  watch: {
    saveCheck () {},
    update () {}
  }
}
</script>
<style>
.debug-simulate {
  border-radius: 4px;
  margin: 25px 15px;
  width: 100%;
  background-color: #000;
  padding: 5px;
  padding-bottom: 0px;
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 1px 10px 1px rgba(0, 0, 0, 0.3);
}

.debug-simulate pre {
  color: #ffffff;
  padding: 6px;
  font-size: 15px;
  line-height: 20px;
  font-family: "Source Code Pro", monospace;
  font-weight: 300;
  white-space: pre-wrap;
  tab-size: 2;
}
</style>
