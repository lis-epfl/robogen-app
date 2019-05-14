<template>
  <form class="vue-form" @submit.prevent="submit">
    <fieldset>
      <div class="row">
        <div class="col-sm-8" style="padding:0">
          <legend>Evolution Settings
            <legend style="font-size:16px">
              {{name}}.evol.txt
              <span
                v-if="!saved"
                style="cursor:pointer; text-decoration:underline; color:blue"
                @click="save_evol_file"
              >Save</span>
            </legend>
          </legend>
        </div>
        <div class="col-sm-4" style="padding:0">Evolution Settings:
          <b-form-select v-model="selectedEvolFile" class="mb-3">
            <option
              v-for="evolFile in evolFiles"
              :key="evolFile"
              :title="evolFile"
              :value="evolFile"
            >{{evolFile}}</option>
            <option :value="null" disabled>-- Please select an Evolution Settings --</option>
          </b-form-select>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-4">
          <div class="row">
            <label class="label" for="robot">Robot File (<span v-if="evolutionMode == 'brain'"> Required </span><span v-else> Optional </span>)</label>
          </div>
          <div class="row">
            <file-select
              v-model="robotFile"
              :accept="[{'name': 'Robogen Robot File', 'ext' :['robot.txt', 'json']}]"
              :defaultPath="projectFolderPath"
              :optional=true
              :mainFolderPath="mainFolderPath"
              ref="robotFile"
            ></file-select>
          </div>
          <!-- <input type="file" name="robot" id="robot" required="" accept=".robot.text"> -->
        </div>
        <div class="col-sm-4">
          <div class="row">
            <label class="label" for="ff">Simulation File (Required)</label>
          </div>
          <div class="row">
            <file-select
              v-model="simFile"
              :accept="[{'name': 'Robogen Simulation File', 'ext' :['sim.txt']}]"
              :defaultPath="projectFolderPath"
              ref="simFile"
            ></file-select>
          </div>
        </div>
        <div class="col-sm-4">
          <label class="label" for="seed2">Seed (Required)</label>
          <b-tooltip target="seed2" placement="top">
            A random seed is a number used to initialize a pseudorandom number generator.
          </b-tooltip>
          <input type="number" name="seed2" id="seed2" required v-model="seed">
        </div>
      </div>
      <div class="row">
        <div class="col-sm-3">
          <div class="row">
            <label class="label" for="vue-form-list" id="evolutionMode">Evolution Mode</label>
            <b-tooltip target="evolutionMode" placement="top">
              Specify whether you want to do brain/body co-evolution (full) or evolve only the brain. 
            </b-tooltip>
          </div>
          <ul class="vue-form-list">
            <li>
              <input type="radio" value="brain" v-model="evolutionMode">
              <label for="radio-1">Brain</label>
            </li>
            <li>
              <input type="radio" value="full" v-model="evolutionMode">
              <label for="radio-2">Full</label>
            </li>
          </ul>
        </div>
        <div class="col-sm-3">
          <label class="label" for="numGenerations">Number of generations</label>
          <b-tooltip target="numGenerations" placement="top">
              Number of generations to evolve for.
            </b-tooltip>
          <input
            type="number"
            name="numGenerations"
            id="numGenerations"
            required
            v-model="numGenerations"
          >
        </div>
        <div class="col-sm-3">
          <label class="label" for="mu">Mu (&mu;)</label>
          <b-tooltip target="mu" placement="top">
              mu (μ) = number of parents.  [ (μ+/,λ) evolution strategy terminology ]. This is the number of individuals selected at each step of the evolution.
            </b-tooltip>
          <input type="number" name="mu" id="mu" required v-model="mu">
        </div>
        <div class="col-sm-3">
          <label class="label" for="lambda">Lambda (&lambda;)</label>
          <b-tooltip target="lambda" placement="top">
          lambda (λ) = number of offspring.  [ (μ+/,λ) evolution strategy terminology ]. This is the number of new individuals generated from the parents at each step of the evolution. Lambda should be larger than or equal to mu. See ‘replacement’ below.
          </b-tooltip>
          <input type="number" name="lambda" id="lambda" required v-model="lambda">
        </div>
      </div>

      <div class="row">
        <div class="col-sm-3">
          <div class="row">
            <label class="label" for="vue-form-list" id="replacement">Replacement</label>
            <b-tooltip target="replacement" placement="top">
          In the case of “plus” replacement, the mu parents and lambda children are grouped together and ranked according to their measured fitness values, the top mu individuals are copied to the new population (elitism). This allows evolution to make sure that good solutions are not lost because of mutation or crossover. On the other hand, in the case of “comma” replacement, the mu parents are discarded, the lambda children are ranked, and the top mu of these are copied to the new population (lambda>=mu). This replacement strategy favors exploration.
          </b-tooltip>
          </div>
          <ul class="vue-form-list">
            <li>
              <input type="radio" value="plus" v-model="replacement">
              <label for="radio-1">Plus</label>
            </li>
            <li>
              <input type="radio" value="comma" v-model="replacement">
              <label for="radio-2">Comma</label>
            </li>
          </ul>
        </div>
        <div class="col-sm-3">
          <label class="label" for="tournamentSize">Tournament Size</label>
          <b-tooltip target="tournamentSize" placement="top">
This parameter determines the size of the tournament pools for selection of individuals. See ‘selection’ above. Setting the tournament size equal to lambda (in case of “comma” replacement) or mu+lambda (in case of “plus” replacement) gives a selection equivalent to truncated rank-based selection.
          </b-tooltip>
          <input
            type="number"
            name="tournamentSize"
            id="tournamentSize"
            required
            v-model="tournamentSize"
          >
        </div>
      </div>

      <div class="row">
        <div role="tablist" class="tablist">
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab" style="height:inherit">
              <b-btn block href="#" v-b-toggle.accordion1 variant="light" style="text-align:left">
                <font-awesome-icon icon="chevron-down"/>&nbsp; Brain Variation Probabilities and Magnitudes
              </b-btn>
            </b-card-header>
            <b-collapse id="accordion1" visible accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <div class="row">
                  <div class="col-sm-3">
                    <label class="label" for="pBrainMutate">Brain Mutation Probability</label>
                    <b-tooltip target="pBrainMutate" placement="top">
The mutation probability for each brain parameter. 
          </b-tooltip>
                    <input
                      type="number"
                      name="pBrainMutate"
                      id="pBrainMutate"
                      min="0"
                      max="1"
                      step="0.01"
                      required
                      v-model="pBrainMutate"
                    >
                  </div>
                  <div class="col-sm-3">
                    <label class="label" for="pBrainCrossover">Brain Crossover Probability</label>
                    <b-tooltip target="pBrainCrossover" placement="top">
                      Probability of 1-point-crossover.  N.B.  Currently crossover is not supported when either doing full body evolution or when pAddHiddenNeuron > 0
                    </b-tooltip>
                    <input
                      type="number"
                      name="pBrainCrossover"
                      id="pBrainCrossover"
                      min="0"
                      max="1"
                      step="0.01"
                      v-model="pBrainCrossover"
                    >
                  </div>
                  <div class="col-sm-3">
                    <label class="label" for="pAddHiddenNeuron">Add Hidden Neuron Probability</label>
                    <b-tooltip target="pAddHiddenNeuron" placement="top">
                      Probability of adding a hidden neuron (will be added to the core component).  N.B.  Cannot have pBrainCrossover > 0 and pAddHiddenNeuron > 0
                    </b-tooltip>
                    <input
                      type="number"
                      name="pAddHiddenNeuron"
                      id="pAddHiddenNeuron"
                      min="0"
                      max="1"
                      step="0.01"
                      v-model="pAddHiddenNeuron"
                    >
                  </div>
                  <div class="col-sm-3">
                    <label class="label" for="pOscillatorNeuron">Add Oscillator Neuron Probability</label>
                    <b-tooltip target="pOscillatorNeuron" placement="top">
                      Probability of new hidden or motor neuron being an oscillator.
                    </b-tooltip>
                    <input
                      type="number"
                      name="pOscillatorNeuron"
                      id="pOscillatorNeuron"
                      min="0"
                      max="1"
                      step="0.01"
                      v-model="pOscillatorNeuron"
                    >
                  </div>
                </div>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab" style="height:inherit">
              <b-btn block href="#" v-b-toggle.accordion2 variant="light" style="text-align:left" :aria-expanded="true">
                <font-awesome-icon icon="chevron-down"/>&nbsp; Body Variation Parameters
              </b-btn>
            </b-card-header>
            <b-collapse id="accordion2" accordion="my-accordion" role="tabpanel" v-if="evolutionMode =='full'" >
              <b-card-body>
                <div class="row">
                  <div class="col-sm-3">
                    <label class="label" for="numInitialParts">Number of inital body parts (min:max)</label>
                    <b-tooltip target="numInitialParts" placement="top">
                      Number of initial body parts (not including core component) for full evolution.
                    </b-tooltip>
                    <input
                      type="text"
                      name="numInitialParts"
                      id="numInitialParts"
                      v-model="numInitialParts"
                    >
                  </div>
                  <div class="col-sm-3">
                    <label class="label" for="addBodyPart">Body Parts that can be added</label>
                    <b-tooltip target="addBodyPart" placement="top">
                      	Add parts to be used in body evolution, can add many parts on separated by `,` or <strong>All</strong> to use all parts. For individual parts you can either use the single-character part codes or the full name in CamelCase (see Guidelines for writing a robot text file).  If doing body evolution it is required to define at least one allowed body part to add.
                    </b-tooltip>
                    <input type="text" name="addBodyPart" id="addBodyPart" v-model="addBodyPart">
                  </div>
                  <div class="col-sm-3">
                    <label class="label" for="maxBodyParts">Maximum Body Parts</label>
                    <b-tooltip target="maxBodyParts" placement="top">
                      	Maximum number of body parts allowed.  Defaults to 100000, an unreasonably large value.
                    </b-tooltip>
                    <input
                      type="number"
                      name="maxBodyParts"
                      id="maxBodyParts"
                      min="0"
                      max="1"
                      step="0.01"
                      v-model="maxBodyParts"
                    >
                  </div>
                  <div class="col-sm-3">
                    <p class="label">Other parameters can be added in other text box</p>
                  </div>
                </div>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-12">
          <label class="label" for="textarea">Other Parameters (<span @click="open('http://robogen.org/docs/evolution-configuration/#Evolution_client_settings')" style="cursor: pointer; text-decoration: underline; color: #2ea169;" >Evolution Settings Documentation</span>)</label>
          <textarea name="textarea" id="textarea" v-model="other"></textarea>
        </div>
      </div>

      <br>

      <div class="row" style="display:none">
        <div class="debug-simulate">
          <div class="robotFileInEvolve">{{referenceRobotFile}}</div>
          <pre><code>{{ simConfig }}</code></pre>
        </div>
      </div>

      <div class="row">
        <div style="width:100%">
          <p style="color:red;float:right">{{validationError}}</p>
        </div>
      </div>
      
      <div class="row">
        <div style="width:100%">
          <input type="button" value="Evolve Robot" :disabled="!isValid" @click="testEvol">
        </div>
      </div>
    </fieldset>
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
    },
    evolFiles: {
      type: Array
    }
  },
  components: {
    FileSelect
  },
  data: function () {
    return {
      name: '',
      evolutionMode: 'brain',
      numGenerations: 40,
      mu: 20,
      lambda: 20,
      replacement: 'plus',
      selection: 'deterministic-tournament',
      tournamentSize: 2,
      pBrainMutate: 0.5,
      pBrainCrossover: 0,
      pAddHiddenNeuron: 0,
      pOscillatorNeuron: 0,
      numInitialParts: '2:10',
      addBodyPart: 'All',
      maxBodyParts: '20',
      seed: Math.floor(Math.random() * (100 - 0)) + 0,
      other: '',
      simFile: '',
      robotFile: '',
      content: '',
      saved: false,
      filepath: '',
      cpuCount: 1,
      referenceRobotFile: '',
      validationError: '',
      selectedEvolFile: '',
      localProjectFolderPath: this.projectFolderPath,
      localSimFiles: this.simFiles,
      localEvolFiles: this.evolFiles,
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
            { name: 'Robogen Evolution File', extensions: ['evol.txt'] }
          ],
          defaultPath: this.projectFolderPath
        },
        fileNames => {
          // fileNames is an array that contains all the selected
          if (fileNames === undefined) {
            console.log('No file selected')
            return
          }
          this.load_evol_file(fileNames[0])
        }
      )
    },
    load_evol_file: function (fileName) {
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the file :' + fileName + err.message)
          return
        }
        this.name = fileName.substring(
          fileName.lastIndexOf('/') + 1,
          fileName.indexOf('.')
        )
        var params = data.split('\n')
        this.other = ''
        this.addBodyPart = ''
        for (var i = 0; i < params.length; i++) {
          var param = params[i]
          if (param.indexOf('#') > -1) {
            // Remove all comments
            param = param.substring(0, param.indexOf('#'))
          }
          // Remove all spaces and \r if old mac file
          param = param.split(' ').join('')
          param = param.split('\r').join('')
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
      if (param.includes('simulatorConfFile=')) {
        this.simFile = this.projectFolderPath + '/' + param.substring('simulatorConfFile='.length)
        this.$refs.simFile.updateFilePath(this.simFile)
      } else if (param.includes('evolutionMode=')) {
        this.evolutionMode = param.substring('evolutionMode='.length)
      } else if (param.includes('numGenerations=')) {
        this.numGenerations = param.substring('numGenerations='.length)
      } else if (param.includes('mu=')) {
        this.mu = param.substring('mu='.length)
      } else if (param.includes('lambda=')) {
        this.lambda = param.substring('lambda='.length)
      } else if (param.includes('replacement=')) {
        this.replacement = param.substring('replacement='.length)
      } else if (param.includes('selection=')) {
        this.selection = param.substring('selection='.length)
      } else if (param.includes('tournamentSize=')) {
        this.tournamentSize = param.substring('tournamentSize='.length)
      } else if (param.includes('pBrainMutate=')) {
        this.pBrainMutate = param.substring('pBrainMutate='.length)
      } else if (param.includes('pBrainCrossover=')) {
        this.pBrainCrossover = param.substring('pBrainCrossover='.length)
      } else if (param.includes('pAddHiddenNeuron=')) {
        this.pAddHiddenNeuron = param.substring('pAddHiddenNeuron='.length)
      } else if (param.includes('pOscillatorNeuron=')) {
        this.pOscillatorNeuron = param.substring('pOscillatorNeuron='.length)
      } else if (param.includes('numInitialParts=')) {
        this.numInitialParts = param.substring('numInitialParts='.length)
      } else if (param.includes('addBodyPart=')) {
        if (this.addBodyPart !== '') {
          this.addBodyPart += ',' + param.substring('addBodyPart='.length)
        } else {
          this.addBodyPart = param.substring('addBodyPart='.length)
        }
      } else if (param.includes('maxBodyParts=')) {
        this.maxBodyParts = param.substring('maxBodyParts='.length)
      } else if (param.includes('referenceRobotFile=')) {
        this.referenceRobotFile = param.substring('referenceRobotFile='.length)
        this.robotFile = this.projectFolderPath + '/' + this.referenceRobotFile
        this.$refs.robotFile.updateFilePath(this.robotFile)
      } else if (
        param.includes('socket=') ||
        param.includes('brainBounds=') ||
        param.includes('brainSigma=')
      ) {
        // Do nothing
      } else {
        this.other += param + '\n'
      }
    },

    save_file: function () {
      // this function is called from child component Fileselect
      this.save_evol_file()
    },
    save_evol_file: function (doEvolve) {
      var self = this
      // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
      if (this.selectedEvolFile === '') {
        dialog.showSaveDialog(
          {
            defaultPath: this.projectFolderPath + '/' + this.name + '.evol.txt',
            filters: [{ name: 'Robogen Evol File', extensions: ['evol.txt'] }]
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
              this.saved = true
              this.filepath = fileName
              if (doEvolve) {
                this.testEvol()
              }
            })
          }
        )
      } else {
        var fileName = this.projectFolderPath + '/' + this.name + '.evol.txt'
        fs.writeFile(fileName, self.content, err => {
          if (err) {
            alert('An error ocurred creating the file ' + err.message)
          }
          this.saved = true
          this.filepath = fileName
          if (doEvolve) {
            this.testEvol()
          }
        })
      }
    },
    testEvol: function () {
      var self = this
      if (!this.saved) {
        this.save_evol_file(true)
      }
      if (this.saved) {
        if (!self.filepath.includes(self.mainFolderPath)) {
          alert(
            'Only the files in the ' + self.mainFolderPath + 'folder can used. Current filepath = ' +
              self.filepath
          )
          return
        }
        var file = self.filepath.substring(
          self.filepath.indexOf(self.mainFolderPath) + self.mainFolderPath.length + 1,
          self.filepath.length
        )
        console.log(file)
        console.log(file.lastIndexOf('/'))

        var folder = file.substring(0, file.lastIndexOf('/'))

        Event.$emit('newEvol', this.numGenerations)
        var ls = childProcess.execFile(
          path.join(__static, 'scripts', 'evol', 'evol.sh'),
          [file, folder, this.seed]
        )

        ls.stdout.on('data', function (data) {
          console.log('stdout: <' + typeof data + '> ')
          Event.$emit('newData', data)
        })

        ls.stderr.on('data', function (data) {
          if (data.includes('ODE message')) {
            console.log('Not doing anything for ODE messages. Error log: ' + data)
          } else {
            console.log('stderr: ' + data)
            Event.$emit('endEvol', -1)
          }
        })

        ls.on('close', function (code) {
          console.log('child process exited with code ' + code)
          Event.$emit('endEvol', code)
        })
      }
    },
    getFileName: function (filePath) {
      var file = filePath.substring(
        filePath.indexOf(this.projectFolderPath) + this.projectFolderPath.length + 1,
        filePath.length
      )
      return file
    }
  },
  computed: {
    simConfig: function () {
      this.saved = false
      this.content = ''

      if (this.robotFile === '') {
        this.referenceRobotFile = '#Evolution from scratch'
      } else {
        this.referenceRobotFile =
          'referenceRobotFile=' + this.getFileName(this.robotFile) + '\n\n'
        this.content += this.referenceRobotFile
      }
      this.content +=
        'simulatorConfFile=' + this.getFileName(this.simFile) + '\n'
      this.content += 'evolutionMode = ' + this.evolutionMode + '\n'
      this.content += 'numGenerations = ' + this.numGenerations + '\n'
      this.content += 'mu = ' + this.mu + '\n'
      this.content += 'lambda = ' + this.lambda + '\n'
      this.content += 'replacement = ' + this.replacement + '\n'
      this.content += 'selection = ' + this.selection + '\n'
      this.content += 'tournamentSize = ' + this.tournamentSize + '\n'
      this.content += '\n#Commonly used brain parameters\n'
      this.content += 'pBrainMutate = ' + this.pBrainMutate + '\n'
      this.content += 'pBrainCrossover = ' + this.pBrainCrossover + '\n'
      this.content += 'pAddHiddenNeuron = ' + this.pAddHiddenNeuron + '\n'
      this.content += 'pOscillatorNeuron = ' + this.pOscillatorNeuron + '\n'
      this.content += '\n#Commonly used body variation parameters\n'
      this.content += 'numInitialParts = ' + this.numInitialParts + '\n'
      var bodyPartArray = this.addBodyPart.split(',')
      for (var i = 0; i < bodyPartArray.length; i++) {
        this.content += 'addBodyPart = ' + bodyPartArray[i] + '\n'
      }
      this.content += 'maxBodyParts = ' + this.maxBodyParts + '\n'
      this.content +=
        'socket=127.0.0.1:49152\nbrainBounds=-3:3\nbrainSigma=.7\n'

      if (this.other !== '') {
        this.content += '\n#Other parameters\n'
        this.content += this.other
      }
      return this.content
    },
    isValid: function () {
      this.validationError = ''
      if (this.evolutionMode === 'brain' && this.robotFile === '') {
        this.validationError += 'Robot file required for brain evolution.'
        return false
      }

      if (this.pBrainCrossover > 0 && this.pAddHiddenNeuron > 0) {
        this.validationError += 'Currently both Brain Crossover Probability and Add Hidden Neuron Probability can be grater than zero.'
        return false
      }

      if (this.$parent.ongoingEvolution) {
        this.validationError += 'Multiple evolution prohibited.'
        return false
      }
      return true
    },
    validate: function () {
      if (this.evolutionMode === 'brain' && this.robotFile === '') {
        alert('Brain evolution requires initial robot morphology')
      }
    },
    update: function () {
      if (this.evolFiles.length > 0) {
        this.$refs.robotFile.updateFilePath('')
        this.load_evol_file(this.projectFolderPath + '/' + this.evolFiles[0])
        this.selectedEvolFile = this.evolFiles[0]
      } else {
        this.name = ''
        this.evolutionMode = 'brain'
        this.numGenerations = 40
        this.mu = 20
        this.lambda = 20
        this.replacement = 'plus'
        this.selection = 'deterministic-tournament'
        this.tournamentSize = 2
        this.pBrainMutate = 0.5
        this.pBrainCrossover = 0
        this.pAddHiddenNeuron = 0
        this.pOscillatorNeuron = 0
        this.numInitialParts = '2:10'
        this.addBodyPart = 'All'
        this.maxBodyParts = '20'
        this.other = ''
        this.simFile = ''
        this.robotFile = ''
        this.content = ''
        this.saved = false
        this.filepath = ''
        this.cpuCount = 1
        this.referenceRobotFile = ''
        this.localProjectFolderPath = this.projectFolderPath
        this.localSimFiles = this.simFiles
        this.localEvolFiles = this.evolFiles
        this.localRobotFiles = this.robotFiles
        this.localMainFolerPath = this.mainFolderPath
      }
      this.saved = true
    }
  },
  watch: {
    // saveCheck () {},
    selectedEvolFile: function () {
      this.load_evol_file(this.projectFolderPath + '/' + this.selectedEvolFile)
    },
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

.robotFileInEvolve {
  margin-top: 5px;
  font-family: "Source Code Pro", monospace;
  color: rgb(82, 156, 230);
  font-weight: 800;
  font-size: 17px;
  margin-bottom: 5px;
}

.tablist {
  width: 100%;
}

.header {
  height: auto;
}
</style>
