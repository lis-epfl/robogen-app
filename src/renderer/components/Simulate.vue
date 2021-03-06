<template>
  <form class="vue-form" @submit.prevent="submit">
    <fieldset>
      <div class="row">
        <div class="col-sm-8" style="padding:0">
          <legend style="border:0;margin:0">Simulation Settings
            <legend style="font-size:16px">
              {{name}}.sim.txt
              <span
                v-if="!saved"
                style="cursor:pointer; text-decoration:underline; color:blue"
                @click="save_sim_file"
              >Save</span>
            </legend>
          </legend>
        </div>
        <div class="col-sm-4" style="padding:0">Simulation Configuration:
          <b-form-select v-model="selectedSimFile" class="mb-3">
            <option
              v-for="simFile in simFiles"
              :key="simFile"
              :title="simFile"
              :value="simFile"
            >{{simFile}}</option>
            <option :value="null" disabled>-- Please select an simulation Settings </option>
          </b-form-select>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-4">
          <div class="row">
            <label class="label" for="robot">Robot File (Required)</label>
          </div>
          <div class="row">
            <file-select
              v-model="robotFile"
              :accept="[{'name': 'Robogen Robot File', 'ext' :['robot.txt', 'json']}]"
              :defaultPath="projectFolderPath" :mainFolderPath="mainFolderPath"
              ref="robotFile"
            ></file-select>
          </div>
          <!-- <input type="file" name="robot" id="robot" required="" accept=".robot.text"> -->
        </div>
        <div class="col-sm-4">
          <div class="row">
            <label class="label" for="ff">Fitness Function (Required)</label>
          </div>
          <div class="row">
            <file-select
              v-model="scenarioFile"
              :accept="[{'name': 'Robogen Scenario File', 'ext' :['js']}]"
              :defaultPath="projectFolderPath" 
              ref="scenarioFile"
            ></file-select>
          </div>
        </div>
        <div class="col-sm-4">
          <label class="label" for="seed" >Seed (Required)</label>
          <b-tooltip
            target="seed"
            placement="seed"
          >A random seed is a number used to initialize a pseudorandom number generator. </b-tooltip>
          <input type="number" name="seed" id="seed" required v-model="seed">
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6">
          <label class="label" for="timeStep" >Time Step (Required)</label>
          <b-tooltip
            target="timeStep"
            placement="topright"
          >Time step of the simulation in seconds. The smaller it is, the less error prone the simulation, but the longer it takes to simulate the same amount of time.</b-tooltip>
          <input type="number" name="timeStep" id="timeStep" required v-model="timeStep">
        </div>

        <div class="col-sm-6">
          <label class="label" for="st">Simulation Time (s)</label>
          <b-tooltip target="st" placement="topright">
            Total length of simulation in seconds. Must be a multiple of timeStep.
            <strong>One of nTimeSteps or simulationTime must be specified.</strong>
          </b-tooltip>
          <input type="number" name="st" id="st" required v-model="simulationTime">
        </div>
      </div>

      <div class="row">
        <div class="col-sm-6">
          <label class="label" for="tf">Terrain Friction</label>
          <b-tooltip
            target="tf"
            placement="topright"
          >Friction coeffecient between the ground/obstacles and the robot. </b-tooltip>
          <input type="number" name="tf" id="tf" required v-model="terrainFriction">
        </div>
        <div class="col-sm-6">
          <label class="label" for="gra">Gravity (m/s^2)</label>
          <b-tooltip
            target="gra"
            placement="topright"
          >Gravity: either a single z-value for g=(0,0,z) or x,y,z (comma separated) for full g vector. Specified in m/(s^2).  Defaults to (0,0,-9.81). </b-tooltip>
          <input type="text" name="gra" id="gra" required v-model="gravity">
        </div>
      </div>

      <div class="row">
        <div class="col-sm-12">
          <label class="label" for="textarea">Other Parameters (<span @click="open('http://robogen.org/docs/evolution-configuration/#Simulator_settings')" style="cursor: pointer; text-decoration: underline; color: #2ea169;" >Simulation Settings Documentation</span>) </label>
          <b-tooltip
            target="textarea"
            placement="topright"
          >Other optional parameters from Robogen Documentation. </b-tooltip>
          
          <textarea name="textarea" id="textarea" v-model="other"></textarea>
        </div>
      </div>
      <br>

      <div class="row" style="display:none">
        <div class="debug-simulate">
          <pre><code>{{ simConfig }}</code></pre>
        </div>
      </div>

      <div class="row">
        <div style="width:100%">
          <input
            type="button"
            value="Simulate Robot"
            :disabled="!isValid"
            @click="testSim"
          >
        </div>
      </div>
    </fieldset>

    <div class="row" style="margin-top:20px">
      <div role="tablist" class="tablist">
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" class="p-1" role="tab" style="height:inherit">
            <b-btn block href="#" v-b-toggle.accordion1 variant="light" style="text-align:left">
              <font-awesome-icon icon="chevron-down"/>&nbsp; Generate Hardware Files
            </b-btn>
          </b-card-header>
          <b-collapse id="accordion1" visible accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <div class="row">
                <label class="label" for="textarea">Output Folder</label>
                <input type="text" name="outfolder" id="outfolder" disabled :value="projectFolderPath+'/output'">
              </div>
               
              <div class="row mt-3">
        <div style="width:100%">
          <input
            type="button"
            value="Generate Output"
            :disabled="!isValid"
            @click="outSim"
          >
        </div>
      </div>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
    </div>
  </form>
</template>
<script>
import path from 'path'
import FileSelect from './Helper/FileSelect.vue'
var app = require('electron').remote
var dialog = app.dialog
var fs = require('fs') // Load the File System to execute our common tasks (CRUD)
const childProcess = require('child_process') // The power of Node.JS
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
      nTimeStep: '',
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
      selectedSimFile: '',
      seed: Math.floor(Math.random() * (100 - 0)) + 0,
      generateHardwareFiles: false,
      localProjectFolderPath: this.projectFolderPath,
      localSimFiles: this.simFiles,
      localRobotFiles: this.robotFiles,
      localMainFolerPath: this.mainFolderPath
    }
  },
  methods: {
    // Open external link
    open (link) {
      this.$electron.shell.openExternal(link)
    },
    // Load file
    open_file: function () {
      dialog.showOpenDialog(
        {
          filters: [
            { name: 'Robogen Simulation File', extensions: ['sim.txt'] }
          ],
          defaultPath: this.projectFolderPath
        },
        fileNames => {
          // fileNames is an array that contains all the selected
          if (fileNames === undefined) {
            console.log('No file selected')
            return
          }
          console.log(fileNames)
          this.load_sim_file(fileNames[0])
        }
      )
    },
    load_sim_file: function (fileName) {
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the file :' + err.message)
          return
        }
        this.name = fileName.substring(
          fileName.lastIndexOf('/') + 1,
          fileName.indexOf('.')
        )
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
      // if (this.robotFiles.length === 1) {
      //   this.robotFile = this.projectFolderPath + '/' + this.robotFiles[0]
      //   this.$refs.robotFile.updateFilePath(this.robotFile)
      // }
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
        this.$refs.scenarioFile.updateFilePath(
          this.projectFolderPath + '/' + this.scenarioFile
        )
      } else if (
        param.includes('terrainType=') ||
        param.includes('terrainLength=') ||
        param.includes('terrainWidth=') ||
        param.includes('actuationFrequency=')
      ) {
        // Do nothing
      } else {
        this.other += param + '\n'
      }
    },
    save_file: function () {
      // this function is called from child component Fileselect
      this.save_sim_file()
    },
    save_sim_file: function (simulate) {
      var self = this
      if (this.selectedSimFile === 'NewSim' || this.selectedSimFile === '') {
      // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        dialog.showSaveDialog(
          {
            defaultPath: self.projectFolderPath + '/' + self.name + '.sim.txt',
            filters: [{ name: 'Robogen Sim File', extensions: ['sim.txt'] }]
          },
          fileName => {
            if (fileName === undefined) {
              console.log("You didn't save the file")
              return
            }

            // fileName is a string that contains the path and filename created in the save file dialog.
            fs.writeFile(fileName, self.content, err => {
              if (err) {
                alert('An error ocurred creating the file ' + err.message)
              }
              self.simFilePath = fileName
              self.saved = true
              if (simulate === true) {
                console.log('Asking to simulate')
                self.simulate(self.mainFolderPath, self.simFilePath, self.robotFile)
              }
            })
          }
        )
      } else {
        var fileName = self.projectFolderPath + '/' + self.name + '.sim.txt'
        fs.writeFile(fileName, self.content, err => {
          if (err) {
            alert('An error ocurred creating the file ' + err.message)
          }
          self.simFilePath = fileName
          self.saved = true
          if (simulate === true) {
            console.log('Asking to simulate 2' + self.mainFolderPath + self.simFilePath + self.robotFile)
            self.simulate(self.mainFolderPath, self.simFilePath, self.robotFile)
          }
        })
      }
    },
    testSim: function () {
      if (!this.saved) {
        this.save_sim_file(true)
      } else {
        console.log('Asking to simulate 3' + self.mainFolderPath + self.simFilePath + self.robotFile)
        this.simulate(this.mainFolderPath, this.simFilePath, this.robotFile)
      }
    },
    outSim: function () {
      this.generateHardwareFiles = true
      console.log('Asking to simulate 4')
      this.simulate(this.mainFolderPath, this.simFilePath, this.robotFile)
    },
    simulate (mainFolderPath, simFilePath, robotFile) {
      if (
        !simFilePath.includes(mainFolderPath) ||
        !robotFile.includes(mainFolderPath)
      ) {
        if (this.generateHardwareFiles) {
          alert('Simulate your robot before generating output')
        } else {
          alert(
            'Only the files in the path' + mainFolderPath + 'folder can used. Current filepath = ' +
              mainFolderPath + ' , ' + simFilePath + ' , ' + robotFile
          )
        }
        return
      }

      var file = simFilePath.substring(
        simFilePath.indexOf(mainFolderPath) + mainFolderPath.length + 1,
        simFilePath.length
      )

      var robFile = robotFile.substring(
        robotFile.indexOf(mainFolderPath) + mainFolderPath.length + 1,
        robotFile.length
      )

      var relativeProjectFolder = this.projectFolderPath.substring(
        robotFile.indexOf(mainFolderPath) + mainFolderPath.length + 1,
        robotFile.length
      )

      var ls

      if (this.generateHardwareFiles === true) {
        console.log('Generate hardware')
        ls = childProcess.execFile(
          path.join(__static, 'scripts', 'sim', 'out.sh'),
          [robFile, file, relativeProjectFolder + '/output']
        )
        this.generateHardwareFiles = false
      } else {
        console.log('Generate hardware')
        ls = childProcess.execFile(
          path.join(__static, 'scripts', 'sim', 'sim.sh'),
          [robFile, file, this.seed]
        )
      }

      ls.stdout.on('data', function (data) {
        console.log('stdout: <' + data + '> ')
        // alert('stdout: <' + data + '> ')
      })

      ls.stderr.on('data', function (data) {
        if (!data.includes('driver') && !data.includes('libGL')) {
          alert(data, 'Robogen Logger')
        }
      })

      ls.on('close', function (code) {
        if (code !== 0) {
          alert('child process exited with code ' + code)
        }
      })
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
      this.content +=
        'terrainType=flat' +
        '\n' +
        'terrainLength=10' +
        '\n' +
        'terrainWidth=10' +
        '\n'
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
        this.selectedSimFile = this.simFiles[0]
      } else {
        this.simulationTime = 8
        this.timeStep = 0.005
        this.terrainFriction = 1.0
        this.gravity = 9.8
        this.actuationFrequency = 25
        this.other = ''
        this.scenarioFile = ''
        this.robotFile = ''
        this.content = ''
        this.saved = false
        this.filepath = ''
        this.name = ''
        this.localProjectFolderPath = this.projectFolderPath
        this.localSimFiles = this.simFiles
      }
      this.saved = true
    }
  },
  watch: {
    selectedSimFile: function () {
      console.log('Loading' + this.selectedSimFile)
      if (this.selectedSimFile === 'NewSim') {
        this.simulationTime = 8
        this.timeStep = 0.005
        this.terrainFriction = 1.0
        this.gravity = 9.8
        this.actuationFrequency = 25
        this.other = ''
        this.scenarioFile = ''
        this.robotFile = ''
        this.content = ''
        this.saved = false
        this.filepath = ''
        this.name = ''
        this.localProjectFolderPath = this.projectFolderPath
        this.localSimFiles = this.simFiles
        this.$refs.robotFile.updateFilePath(this.robotFile)
        this.$refs.scenarioFile.updateFilePath(this.scenarioFile)
      } else {
        this.load_sim_file(this.projectFolderPath + '/' + this.selectedSimFile)
      }
    },
    // saveCheck () {},
    update () {}
  },
  created () {
    var self = this
    Event.$on('visualize', function (vis) {
      self.simulate(self.mainFolderPath, vis['simConfFile'], vis['robotfile'])
    })
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

.tooltip-inner {
  max-width: 400px;
}
</style>
