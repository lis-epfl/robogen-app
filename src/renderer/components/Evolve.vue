<template>
  <form class="vue-form" @submit.prevent="submit">
    <fieldset>
      <legend>Evolver Configuration</legend>
      <div class="row">
        <div class="col-sm-6">
            <label class="label" for="robot">Robot File (Optional for full evolution)</label>
            <file-select v-model="robotFile" :accept="[{'name': 'Robogen Robot File', 'ext' :'robot.txt'}]"></file-select>
            <!-- <input type="file" name="robot" id="robot" required="" accept=".robot.text"> -->
        </div>
        <div class="col-sm-6">
            <label class="label" for="ff">Simulation File (Required) </label>
            <file-select v-model="simFile" :accept="[{'name': 'Robogen Simulation File', 'ext' :'sim.txt'}]"></file-select>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-4" style="display:none">
          <h4>Team Member</h4>
          <p class="select">
            <select >
              <option value="0">Sarah Drasner</option>
              <option value="1">Evan You</option>
            </select>
          </p>
        </div>
        <div class="col-sm-3">
          <label class="label" for="vue-form-list">Evolution Mode </label>
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
            <input type="number" name="numGenerations" id="numGenerations" required="" v-model="numGenerations">
        </div>
        <div class="col-sm-3">
            <label class="label" for="mu">Mu (&mu;) </label>
            <input type="number" name="mu" id="mu" required="" v-model="mu">
        </div>
        <div class="col-sm-3">
            <label class="label" for="lambda">Lambda (&lambda;)</label>
            <input type="number" name="lambda" id="lambda" required="" v-model="lambda">   
        </div>
      </div>

      <div class="row">
        <div class="col-sm-3">
          <label class="label" for="vue-form-list">Replacement</label>
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
            <input type="number" name="tournamentSize" id="tournamentSize" required="" v-model="tournamentSize">
        </div>
      </div>

      <div class="row">
        <div role="tablist" class="tablist">
    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab" style="height:inherit">
        <b-btn block href="#" v-b-toggle.accordion1 variant="light" style="text-align:left"> <font-awesome-icon icon="chevron-down" /> &nbsp; Brain Variation Probabilities and Magnitudes</b-btn>
      </b-card-header>
      <b-collapse id="accordion1" visible accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <div class="row">
        <div class="col-sm-3">
            <label class="label" for="pBrainMutate">Brain Mutation Probability</label>
            <input type="number" name="pBrainMutate" id="pBrainMutate" min="0" max="1" step="0.01"  required="" v-model="pBrainMutate">
        </div>
        <div class="col-sm-3">
            <label class="label" for="pBrainCrossover">Brain Crossover Probability</label>
            <input type="number" name="pBrainCrossover" id="pBrainCrossover" min="0" max="1" step="0.01" v-model="pBrainCrossover">
        </div>
        <div class="col-sm-3">
            <label class="label" for="pAddHiddenNeuron">Add Hidden Neuron Probability</label>
            <input type="number" name="pAddHiddenNeuron" id="pAddHiddenNeuron" min="0" max="1" step="0.01" v-model="pAddHiddenNeuron">   
        </div>
        <div class="col-sm-3">
            <label class="label" for="pOscillatorNeuron">Add Oscillator Neuron Probability</label>
            <input type="number" name="pOscillatorNeuron" id="pOscillatorNeuron" min="0" max="1" step="0.01" v-model="pOscillatorNeuron">   
        </div>
      </div>

        </b-card-body>
      </b-collapse>
    </b-card>
    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab" style="height:inherit">
        <b-btn block href="#" v-b-toggle.accordion2 variant="light" style="text-align:left"> <font-awesome-icon icon="chevron-down" /> &nbsp; Body Variation Parameters</b-btn>
      </b-card-header>
      <b-collapse id="accordion2" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <div class="row">
        <div class="col-sm-3">
            <label class="label" for="numInitialParts">Number of inital body parts (min:max)</label>
            <input type="text" name="numInitialParts" id="numInitialParts" v-model="numInitialParts">
        </div>
        <div class="col-sm-3">
            <label class="label" for="addBodyPart">Body Parts that can be added</label>
            <input type="text" name="addBodyPart" id="addBodyPart" v-model="addBodyPart">
        </div>
        <div class="col-sm-3">
            <label class="label" for="maxBodyParts">Maximum Body Parts</label>
            <input type="number" name="maxBodyParts" id="maxBodyParts" min="0" max="1" step="0.01" v-model="maxBodyParts">   
        </div>
        <div class="col-sm-3">
            <p class="label">Other parameters can be added in other text box</p>   
        </div>
      </div>
        </b-card-body>
      </b-collapse>
    </b-card>
    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab" style="height:inherit">
        <b-btn block href="#" v-b-toggle.accordion3 variant="light" style="text-align:left"> <font-awesome-icon icon="chevron-down" /> &nbsp; Output</b-btn>
      </b-card-header>
      <b-collapse id="accordion3" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <p class="card-text">
            text
          </p>
        </b-card-body>
      </b-collapse>
    </b-card>
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
        <input type="button" value="Test Me" :disabled="!isValid" @click="testEvol" >
        </div>
      </div>
    </fieldset>
  </form>
</template>
<script>
import FileSelect from './Helper/FileSelect.vue'
var app = require('electron').remote
var dialog = app.dialog
var os = require('os')
var fs = require('fs') // Load the File System to execute our common tasks (CRUD)
const process = require('child_process') // The power of Node.JS
export default {
  components: {
    FileSelect
  },
  data: function () {
    return {
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
      other: '',
      simFile: '',
      robotFile: '',
      content: '',
      saved: false,
      filepath: '',
      cpuCount: 1
    }
  },
  methods: {
    save_sim_file: function () {
      var self = this
      // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
      dialog.showSaveDialog(
        {
          defaultPath: this.name + '.evol.txt',
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
            alert('The file has been succesfully saved')
          })
        }
      )
    },
    testEvol: function () {
      var self = this
      if (this.saved) {
        if (!self.filepath.includes('examples')) {
          alert('Only the files in the example folder can used')
          return
        }
        var file = self.filepath.substring(
          self.filepath.indexOf('examples') + 9,
          self.filepath.length
        )
        console.log(file)
        var ls = process.spawn('./scripts/evol/evol.sh', [file])

        ls.stdout.on('data', function (data) {
          console.log('stdout: <' + data + '> ')
        })

        ls.stderr.on('data', function (data) {
          console.log('stderr: ' + data)
          alert(data)
        })

        ls.on('close', function (code) {
          console.log('child process exited with code ' + code)
          // if (code == 0) { setStatus('child process complete.') } else { setStatus('child process exited with code ' + code) }
          // getDroidOutput().style.background = 'DarkGray'
        })
      } else {
        self.save_sim_file()
        if (self.saved) {
          self.testEvol()
        }
      }
    }
  },
  computed: {
    simConfig: function () {
      this.saved = false
      this.content = ''

      if (this.robotFile === '') {
        this.content += '#Evolution from scratch\n\n'
      } else {
        this.content += 'referenceRobotFile=' + this.robotFile + '\n\n'
      }
      this.content += 'simulatorConfFile=' + this.simFile + '\n'
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
      this.content += 'addBodyPart = ' + this.addBodyPart + '\n'
      this.content += 'maxBodyParts = ' + this.maxBodyParts + '\n'
      this.content += 'socket=172.17.0.3:49152\nbrainBounds=-3:3\nbrainSigma=.7\n'

      if (this.other !== '') {
        this.content += '\n#Other parameters\n'
        this.content += this.other
      }
      return this.content
    },
    isValid: function () {
      if (this.evolutionMode === 'brain' && this.robotFile === '') {
        return false
      }
      return true
    },
    validate: function () {
      if (this.evolutionMode === 'brain' && this.robotFile === '') {
        alert('Brain evolution requires initial robot morphology')
      }
    }
  },
  mounted () {
    this.cpuCount = os.cpus().length
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

.tablist {
  width: 100%;
}
</style>
