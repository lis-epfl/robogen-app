<template>
 <form class="vue-form" @submit.prevent="submit">
    <fieldset>
      <div class="row">
          <div class="col-sm-8" style="padding:0"> <legend style="border:0;margin:0">Evolution Results </legend></div>
      </div>
      <!-- <p>Maximum number of parallel fitness evaluations threads: {{ cpuCount }}</p>
      <b-progress :max="maxCpuCount">
        <b-progress-bar :value="cpuCount">
          <strong>{{ cpuCount }} / {{ maxCpuCount }}</strong>
        </b-progress-bar>
      </b-progress>
      <br> -->
      <!-- <div>
        <b-button :disabled="cpuCount >= maxCpuCount" v-on:click="addCpu">Add 1 CPU</b-button>
        <b-button :disabled="cpuCount == 1" v-on:click="removeCpu">Remove 1 CPU</b-button>
      </div> -->

      <hr>
      <b-tabs v-model="tabIndex">
        <b-tab title="Past Evolutions">

          <div v-if="actualResultFolders.length==0" style="text-align:center">
            <p>No Past evoltions found.</p>
          </div>
          <div v-else>
          <br>
          <b-form-select v-model="selectedFolder" class="mb-3">
            <option :value="null" disabled>-- Please select an pre-evolved folder --</option>
            <option v-for="folder in actualResultFolders" :key="folder" :title="folder" :value="folder">{{folder}}</option>
          </b-form-select>
          <div v-if="selectedFolder!=''">
            <br>
            <div style="width:100%">
              <v-chart :options="pastGraphOptions" :autoResize="true"/>
            </div>
            <hr>
            <b-table striped bordered outlined hover footClone :items="pastEvolution" :fields="fields" >
              <template slot="individuals" slot-scope="data">
                <b-row>
                  <b-col cols="12">
                <b-progress :max="pastPopulation" >
                  <b-progress-bar v-for="(fitnessValue,index) in data.item.fitness" :key="index" :value="1" v-b-tooltip.hover :title="getTooltip(data.item.generation, index , fitnessValue)" :style="{ backgroundColor: getColour(fitnessValue, minFitness, maxFintess , data.item.fitness, true)}" style="cursor: pointer;"><span v-on:click="getVis(data.item.generation, index , fitnessValue, false)" style="width:100%;height:100%"></span></b-progress-bar>
                </b-progress>
                  </b-col>
                </b-row>
              </template>
              <template slot="row-details" slot-scope="data">
                <b-card v-if="pastNnVis.generation == data.item.generation">
                  <br>
                  <b-row class="mb-2">
                    <b-col class="text-center" style="font-size:25px;">Generation {{pastNnVis.generation}} (Individual {{pastNnVis.individual}})</b-col>
                  </b-row>
                  <b-row class="mb-2">
                    <b-table bordered outlined small fixed :items="pastNnVis.items" :fields="pastNnVis.fields">
                      <template slot="x" slot-scope="neuron">
                        <div v-b-tooltip.hover :title="getTooltipForNNVisItem(neuron)">
                           <span v-if="neuron.item.x.type==='sigmoid'">SIG</span>
                           <span v-else-if="neuron.item.x.type==='simple'">IN</span>
                           <span v-else-if="neuron.item.x.type==='oscillator'">OSC</span>
                           <span v-else>{{neuron.item.x.type}}</span>
                         </div>
                      </template>
                      <template v-for="(title,index) in pastNnVis.fields" :slot="getTitle(title)" slot-scope="neuron">
                         <div v-b-tooltip.hover :title="getTooltipForNNVis(neuron)" :key="index">
                           <span v-if="neuron.field.type==='sigmoid'">SIG</span>
                           <span v-else-if="neuron.field.type==='simple'">IN</span>
                           <span v-else-if="neuron.field.type==='oscillator'">OSC</span>
                           <span v-else>{{neuron.field.type}}</span>
                         </div>
                      </template>

                    </b-table>
                  </b-row>
                  <!-- <b-row class="mb-2">
                    <b-col sm="3" class="text-sm-right"><b>Is Active:</b></b-col>
                    <b-col>{{ row.item.isActive }}</b-col>
                  </b-row> -->
                  <!-- <b-button size="sm" @click="data.toggleDetails;">Hide Details</b-button> -->
                </b-card>
              </template>

              <template slot="best" scope="data">
                <span v-if="data.item.best == -1000000"><font-awesome-icon icon="spinner" spin/></span>
                <span v-if="data.item.best == -1111111" style="color:red"><font-awesome-icon icon="window-close"/> &nbsp;Terminated </span>
                <span v-else>{{data.item.best}}</span>
              </template>
              <template slot="avg" scope="data">
                <span v-if="data.item.avg == -1000000"><font-awesome-icon icon="spinner" spin/></span>
                <span v-if="data.item.avg == -1111111" style="color:red"><font-awesome-icon icon="window-close"/> &nbsp;Terminated </span>
                <span v-else>{{data.item.avg}}</span>
              </template>
              <template slot="std" scope="data">
                <span v-if="data.item.std == -1000000"><font-awesome-icon icon="spinner" spin/></span>
                <span v-if="data.item.std == -1111111" style="color:red"><font-awesome-icon icon="window-close"/> &nbsp;Terminated </span>
                <span v-else>{{data.item.std}}</span>
              </template>
            </b-table>
          </div>
          <div v-else style="text-align:center">
            <p>Please select one of the evolutions to Visuvalize.</p>
          </div>
          </div>
        </b-tab>

        <b-tab title="Ongoing Evolution" key="Ongoing Evolution"  >
            <br>
            <div v-if="!ongoingEvolution" style="text-align:center">
              <p> No ongoing evolution</p>
            </div>
            <div v-else>
              <b-button v-b-modal.terminateConfirm variant="danger" style="float:right">Terminate Evolution</b-button>

              <b-modal id="terminateConfirm" hide-footer centered title="Terminate Evolution">
                <div class="d-block text-center">
                  <p>Are you sure to terminate the ongoing evolution?</p>
                </div>
                <div style="text-align: center;">
                <b-button class="mt-3 mb-4" variant="danger" @click="terminateEvolution()">Yes, Terminate the evolution</b-button>
                <b-button class="mt-3 mb-4" variant="info" @click="hideTerminationModel()">No, Continue evolution</b-button>
                </div>
              </b-modal>

            <div style="width:100%;padding-top:55px">
            <v-chart :options="options" :autoResize="true"/>
            </div>
            <hr style="margin:0">
            <span class="text-center" 
            >Performance scale</span>
              <b-progress :max="100">
                <b-progress-bar v-for="n in 100" :key="n" :value="1" v-b-tooltip.hover :title="n" :style="{ backgroundColor: getColour(n,1,100,[],false)}" style="cursor: pointer;"><span style="width:100%;height:100%"></span></b-progress-bar>
              </b-progress>
              <span style="float:left">Poor</span>
              <span style="float:right">Best</span>
              <hr>

            <b-table striped bordered outlined hover footClone :items="evolution" :fields="fields" >
              <template slot="individuals" slot-scope="data">
                <b-row>
                  <b-col cols="12">
                <b-progress :max="population" >
                  <b-progress-bar v-for="(fitnessValue,index) in data.item.fitness" :key="index" :value="1" v-b-tooltip.hover :title="getTooltip(data.item.generation, index , fitnessValue)" :style="{ backgroundColor: getColour(fitnessValue, minFitness, maxFintess , data.item.fitness, true)}" style="cursor: pointer;"><span v-on:click="getVis(data.item.generation, index , fitnessValue,true)" style="width:100%;height:100%"></span></b-progress-bar>
                </b-progress>
                  </b-col>
                </b-row>
              </template>
              <template slot="row-details" slot-scope="data">
                <b-card v-if="nnVis.generation == data.item.generation">
                  <br>
                  <b-row class="mb-2">
                    <b-col class="text-center" style="font-size:25px;">Generation {{nnVis.generation}} (Individual {{nnVis.individual}})</b-col>
                  </b-row>
                  <b-row class="mb-2">
                    <b-table bordered outlined small fixed :items="nnVis.items" :fields="nnVis.fields">
                      <template slot="x" slot-scope="neuron">
                        <div v-b-tooltip.hover :title="getTooltipForNNVisItem(neuron)">
                           <span v-if="neuron.item.x.type==='sigmoid'">SIG</span>
                           <span v-else-if="neuron.item.x.type==='simple'">IN</span>
                           <span v-else-if="neuron.item.x.type==='oscillator'">OSC</span>
                           <span v-else>{{neuron.item.x.type}}</span>
                         </div>
                      </template>
                      <template v-for="(title,index) in nnVis.fields" :slot="getTitle(title)" slot-scope="neuron">
                         <div v-b-tooltip.hover :title="getTooltipForNNVis(neuron)" :key="index">
                           <span v-if="neuron.field.type==='sigmoid'">SIG</span>
                           <span v-else-if="neuron.field.type==='simple'">IN</span>
                           <span v-else-if="neuron.field.type==='oscillator'">OSC</span>
                           <span v-else>{{neuron.field.type}}</span>
                         </div>
                      </template>

                    </b-table>
                  </b-row>
                  <!-- <b-row class="mb-2">
                    <b-col sm="3" class="text-sm-right"><b>Is Active:</b></b-col>
                    <b-col>{{ row.item.isActive }}</b-col>
                  </b-row> -->
                  <!-- <b-button size="sm" @click="data.toggleDetails;">Hide Details</b-button> -->
                </b-card>
              </template>

              <template slot="best" scope="data">
                <span v-if="data.item.best == -1000000"><font-awesome-icon icon="spinner" spin/></span>
                <span v-else>{{data.item.best}}</span>
              </template>
              <template slot="avg" scope="data">
                <span v-if="data.item.avg == -1000000"><font-awesome-icon icon="spinner" spin/></span>
                <span v-else>{{data.item.avg}}</span>
              </template>
              <template slot="std" scope="data">
                <span v-if="data.item.std == -1000000"><font-awesome-icon icon="spinner" spin/></span>
                <span v-else>{{data.item.std}}</span>
              </template>
            </b-table>
            </div>
        </b-tab>
      </b-tabs>
    </fieldset>
 </form>
</template>

<script>
import 'echarts/lib/component/axis'
import 'echarts/lib/echarts' // The power of Node.JS
import path from 'path'
var fs = require('fs') // Load the File System to execute our common tasks (CRUD)
// var os = require('os')
const childProcess = require('child_process')
var cmap = require('colormap')
export default {
  props: {
    mainFolderPath: {
      type: String
    },
    projectFolderPath: {
      type: String
    },
    resultFolders: {
      type: Array
    }
  },
  data: function () {
    return {
      localProjectFolderPath: this.projectFolderPath,
      localMainFolerPath: this.mainFolderPath,
      localResultFolders: this.resultFolders,
      selectedFolder: '',
      maxCpuCount: 1,
      cpuCount: 1,
      progress: 0,
      evolution: [{'generation': '1', 'best': -1000000, 'avg': -1000000, 'std': -1000000, 'fitness': [2, 2, 3, 4]}, {'generation': '2', 'best': -1000000, 'avg': -1000000, 'std': -1000000, 'fitness': [2, 0, 3, 4]}],
      maxGenerations: 0, // WIll be updated on new evol event
      // {"generation":"1","best":0.000539646,"avg":0.000106292,"std":0.000146535,"fitness":[1,2,3,4]}
      pastEvolution: [],
      // {'foldername': [{}, {}]}
      maxFintess: 0,
      minFitness: 100000000, // Unreasonably high value
      population: 0,
      pastPopulation: 0,
      message: '',
      ongoingEvolution: false,
      tabIndex: 0,
      pastGraphOptions: {},
      // {'foldername': options}
      options: {
        title: {
          text: 'Fitness Evolution',
          subtext: '',
          left: 'left'
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {show: true}
          }
        },
        legend: {
          data: ['Best', 'Average', 'STD']
        },
        xAxis: {
          type: 'category',
          name: 'Generation',
          nameLocation: 'Center',
          nameTextStyle: {
            padding: [70, 0, 0, 0],
            fontSize: 18
          },
          data: [],
          nameGap: 35
        },
        yAxis: {
          type: 'value',
          name: 'Fitness Value',
          nameLocation: 'Center',
          nameTextStyle: {
            padding: [0, 0, 100, -50],
            fontSize: 18
          },
          min: 0,
          nameRotate: 90,
          nameGap: 50
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            animation: true,
            label: {
              backgroundColor: '#ccc',
              borderColor: '#aaa',
              borderWidth: 1,
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              textStyle: {
                color: '#222'
              }
            }
          },
          formatter: function (params) {
            return 'Generation ' + params[0].axisValue + '<br>Best Fitness = ' + params[0].value + '<br>Average Fitness = ' + params[1].value + '<br>STD = ' + params[3].value
          }
        },
        series: [
          {
            name: 'Best',
            data: [],
            type: 'line',
            smooth: false
          },
          {
            name: 'Average',
            data: [],
            type: 'line',
            smooth: false
          },
          {
            type: 'line',
            data: [],
            lineStyle: {
              normal: {
                opacity: 0
              }
            },
            stack: 'std',
            symbol: 'none'
          },
          {
            name: 'STD',
            type: 'line',
            data: [],
            lineStyle: {
              normal: {
                opacity: 0
              }
            },
            areaStyle: {
              normal: {
                color: '#ccc'
              }
            },
            stack: 'std',
            symbol: 'none'
          }
        ]
      },
      fields: {
        generation: {
          label: 'Generation',
          sortable: true
        },
        best: {
          label: 'Best Fitness',
          sortable: true
        },
        avg: {
          label: 'Mean Fitness',
          sortable: true
        },
        std: {
          label: 'Stdev Fitness',
          sortable: true
        },
        individuals: {
          label: 'Performance Distribution within population',
          class: 'individuals'
        }
      },
      nnVis: { 'generation': 0, 'individual': 0, 'items': [], 'fields': [] },
      pastNnVis: { 'generation': 0, 'individual': 0, 'items': [], 'fields': [] },
      colours: []

    }
  },
  methods: {
    getTitle (title) {
      return 'HEAD_' + title.label
    },
    getTooltipForNNVis (neuron) {
      return 'ID = ' + neuron.field.key + '\nType =' + neuron.field.type + '\nLayer =' + neuron.field.layer
    },
    getTooltipForNNVisItem (neuron) {
      return 'ID = ' + neuron.item.x.label + '\nType =' + neuron.item.x.type + '\nLayer =' + neuron.item.x.layer
    },
    addCpu () {
      if (this.cpuCount < this.maxCpuCount) {
        this.cpuCount += 1
      }
    },
    removeCpu () {
      if (this.cpuCount > 1) {
        this.cpuCount -= 1
      }
    },
    checkNaN (fitness) {
      if (fitness.length <= 1) {
        return true
      }
      for (var i = 0; i < fitness.length; i++) {
        if (isNaN(fitness[i])) {
          return true
        }
      }
      // Update minmax for colourmap
      var tempMax = Math.max.apply(null, fitness)
      var tempMin = Math.min.apply(null, fitness)
      if (this.maxFintess < tempMax) {
        this.maxFintess = tempMax
      }
      if (this.minFitness > tempMin) {
        this.minFitness = tempMin
      }
      return false
    },
    validate (gen) {
      var best = gen['best']
      var average = gen['avg']
      // var std = gen['std']
      var fitnesses = gen['fitness']

      // Best shoud be one of the individuvial. Sometime console outputs 002525 instead of 0.002525
      if (Math.max.apply(null, fitnesses) !== best) {
        console.log('Best reset. Obtained=' + best + ' Actual=' + Math.max.apply(null, fitnesses))
        gen['best'] = Math.max.apply(null, fitnesses) // Reset the best
      }

      const averageFunc = arr => arr.reduce((p, c) => p + c, 0) / arr.length
      var calculatedMean = averageFunc(fitnesses)
      if (Math.abs(calculatedMean - average) > 0.1) {
        console.log('Mean reset. Obtained=' + average + ' Actual=' + averageFunc(fitnesses))
        gen['avg'] = averageFunc(fitnesses) // Reset the best
      }

      return gen
    },
    getColour (fitness, minFitness, maxFitness, fitnesses, local) {
      // local - locally colour scale fitness value
      if (local) {
        // minFitness and maxFitness are the global maxima and minima
        maxFitness = Math.max.apply(null, fitnesses)
        minFitness = Math.min.apply(null, fitnesses)
      }

      var location = (fitness - minFitness) / (maxFitness - minFitness)
      location = parseInt(location * this.colours.length)
      // if (fitness === maxFitness) {
      //   return '#00FF00'
      // }
      if (location !== 0) {
        location--
      }
      return this.colours[location]
    },
    getTooltip (generation, index, fitnessValue) {
      var tooltip = ''
      if (fitnessValue === this.maxFitness) {
        tooltip += 'Evolution\'s Best \n'
      }
      return tooltip + 'G' + generation + ' (I' + (index + 1) + ') : ' + fitnessValue
    },
    getLatestEvolFolder () {
      var files = fs.readdirSync(this.projectFolderPath)
      var latest = -1
      for (var i = 0; i < files.length; i++) {
        if (files[i].includes('evol_results_')) {
          if (parseInt(files[i].substring('evol_results_'.length)) > latest) {
            latest = parseInt(files[i].substring('evol_results_'.length))
          }
        } else if (files[i].includes('evol_results')) {
          if (latest < 0) {
            latest = 0
          }
        }
      }

      if (latest === 0) {
        return 'evol_results'
      } else if (latest > 0) {
        return 'evol_results_' + latest
      } else {
        return null
      }
    },
    getVis (generation, index, fitnessValue, ongoingEvolution) {
      var individual = index + 1 // Update by one for individual
      var folder = ''
      if (ongoingEvolution) {
        folder = this.projectFolderPath + '/' + this.getLatestEvolFolder()
      } else {
        folder = this.projectFolderPath + '/' + this.selectedFolder
      }
      // Get Sim Conf File from the folder
      var simConfFile = folder
      var files = fs.readdirSync(folder)
      for (var i = 0; i < files.length; i++) {
        if (files[i].includes('.sim.txt')) {
          simConfFile += '/' + files[i]
          break
        }
      }

      var vis = {}
      vis['robotfile'] = folder + '/Generation-' + generation + '-Guy-' + individual + '.json'
      // vis['robotfile'] = folder + '/GenerationBest-' + generation + '.json'
      vis['simConfFile'] = simConfFile

      fs.readFile(vis['robotfile'], 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the file :' + err.message)
          return
        }
        var neuralNetwork = JSON.parse(data)
        var tempFields = {}
        var connection = {}
        var allLabel = {} // Contains column id {'neuron id': temprory id}
        var zeroArray = []
        tempFields['x'] = {}
        tempFields['x']['label'] = ''
        for (var i = 0; i < neuralNetwork.brain.neuron.length; i++) {
          tempFields[neuralNetwork.brain.neuron[i].id] = {}
          tempFields[neuralNetwork.brain.neuron[i].id]['label'] = neuralNetwork.brain.neuron[i].id
          tempFields[neuralNetwork.brain.neuron[i].id]['type'] = neuralNetwork.brain.neuron[i].type
          tempFields[neuralNetwork.brain.neuron[i].id]['layer'] = neuralNetwork.brain.neuron[i].layer
          allLabel[neuralNetwork.brain.neuron[i].id] = i
          if (neuralNetwork.brain.neuron[i].layer !== 'input') {
            connection[neuralNetwork.brain.neuron[i].id] = []
          }
          zeroArray.push(0)
        }

        // Initialize the connections with 0 matrix
        for (var key in connection) {
          connection[key] = new Array(zeroArray.length).fill(0)
        }
        if (neuralNetwork.brain.hasOwnProperty('connection')) {
          // Update the connections
          for (i = 0; i < neuralNetwork.brain.connection.length; i++) {
            var tempIndex = allLabel[neuralNetwork.brain.connection[i].src]
            connection[neuralNetwork.brain.connection[i].dest][tempIndex] = neuralNetwork.brain.connection[i].weight.toFixed(2)
          }
        }
        if (ongoingEvolution) {
          this.nnVis.fields = tempFields
          this.nnVis.items = [] // Reset
          var connectionItem, j, key2
          for (key in connection) {
            connectionItem = {}
            connectionItem['x'] = tempFields[key]
            j = 0
            for (key2 in allLabel) {
              connectionItem[key2] = connection[key][j]
              j++
            }
            this.nnVis.items.push(connectionItem)
          }
          this.nnVis['generation'] = generation
          this.nnVis['individual'] = individual
        } else {
          this.pastNnVis.fields = tempFields
          this.pastNnVis.items = [] // Reset

          for (key in connection) {
            connectionItem = {}
            connectionItem['x'] = tempFields[key]
            j = 0
            for (key2 in allLabel) {
              connectionItem[key2] = connection[key][j]
              j++
            }
            this.pastNnVis.items.push(connectionItem)
          }
          this.pastNnVis['generation'] = generation
          this.pastNnVis['individual'] = individual
        }
        Event.$emit('visualize', vis) // Visuvalize the robot
      })
    },
    updateResult (msg) {
      this.message += msg
      var index = ''
      if (this.message.includes('individuals')) {
        index = this.message.indexOf('individuals') - 1
        var tempPop = this.message.substring(this.message.slice(0, index).lastIndexOf('\n') + 1, index)
        if (!isNaN(tempPop)) {
          if (this.population < parseInt(tempPop)) {
            this.population = parseInt(tempPop)
          }
        }
        this.progress += this.message.split('.').length
        this.message = this.message.replace('.', '') // Remove dots from the message
      }
      while (this.message.includes('mainEvolutionLoop')) {
        this.progress = 0
        // Parse the data
        index = this.message.indexOf('mainEvolutionLoop') + 'mainEvolutionLoop \nGeneration '.length - 1
        var generationCount = this.message.substring(index, index + this.message.slice(index, this.message.length).indexOf(','))
        index = this.message.indexOf('Best: ') + 6
        var best = this.message.substring(index, index + this.message.slice(index, this.message.length).indexOf(' '))
        index = this.message.indexOf('Average: ') + 9
        var average = this.message.substring(index, index + this.message.slice(index, this.message.length).indexOf(' '))
        index = this.message.indexOf('STD: ') + 5
        var stdev = this.message.substring(index, index + this.message.slice(index, this.message.length).indexOf('\n'))

        // console.log('Generation count: ' + generationCount)
        // console.log('Best: ' + best)
        // console.log('Average: ' + average)
        // console.log('STD: ' + stdev)

        index = this.message.indexOf('All fitnesses:') + 15
        var end = index + this.message.slice(index, this.message.length).indexOf('\n')
        var fitness = this.message.substring(index, end).split(' ')
        // console.log('Fitness: ' + fitness)

        if (isNaN(generationCount) || isNaN(best) || isNaN(average) || isNaN(stdev) || this.checkNaN(fitness)) {
          console.log('Invalid parsing')
          console.log(this.message)
          console.log('Generation count: ' + generationCount)
          console.log('Best: ' + best)
          console.log('Average: ' + average)
          console.log('STD: ' + stdev)
          console.log('Fitness: ' + fitness)
          break
        } else {
          var generation = {}
          generation['generation'] = generationCount
          generation['best'] = parseFloat(best)
          generation['avg'] = parseFloat(average)
          generation['std'] = parseFloat(stdev)
          generation['fitness'] = fitness.map(Number)
          generation = this.validate(generation)
          generation['_showDetails'] = true

          this.message = this.message.substring(end) // Erase the part above
          var loading = this.evolution.pop()
          this.evolution.push(generation)
          if (parseInt(generationCount) < this.maxGenerations) {
            loading['generation'] = parseInt(generationCount) + 1
            this.evolution.push(loading)
          }
          this.options.xAxis.data.push(generation['generation'])
          this.options.series[0].data.push(generation['best'])
          this.options.series[1].data.push(generation['avg'])
          var low = parseFloat(generation['avg']) - parseFloat(generation['std']) / 2
          this.options.series[2].data.push(low)
          this.options.series[3].data.push(parseFloat(generation['std']))
        }
      }
      // if (this.message !== '') {
      //   console.log('Remaining message = ' + this.message)
      // }
    },
    loadResultsTreditionally (projectFolderPath, resultFolder) {
      console.log('Reupdating past evolution')
      // This will be executed on error
      // Load BestAvgStd.txt
      if (resultFolder == null) {
        return
      }
      var fileName = projectFolderPath + '/' + resultFolder + '/BestAvgStd.txt'
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the reupdate file :' + err.message)
          return
        }
        var values = data.split('\n').join(' ').split(' ')
        // Initialize
        this.pastEvolution = [] // Data for table
        this.pastGraphOptions = JSON.parse(JSON.stringify(this.options)) // Make a copy of options for graph
        this.pastGraphOptions.tooltip.formatter = function (params) {
          return 'Generation ' + params[0].axisValue + '<br>Best Fitness = ' + params[0].value + '<br>Average Fitness = ' + params[1].value + '<br>STD = ' + params[3].value
        }
        // Reset data
        this.pastGraphOptions.xAxis.data = []
        this.pastGraphOptions.series[0].data = []
        this.pastGraphOptions.series[1].data = []
        this.pastGraphOptions.series[2].data = []
        this.pastGraphOptions.series[3].data = []

        // Loop and populate
        for (var i = 0; i < values.length; i = i + 4) {
          var generation = {}
          var generationCount = values[i]
          var best = values[i + 1]
          var average = values[i + 2]
          var stdev = values[i + 3]
          generation['generation'] = parseInt(generationCount)
          generation['best'] = parseFloat(best)
          generation['avg'] = parseFloat(average)
          generation['std'] = parseFloat(stdev)
          generation['fitness'] = []
          if (!(isNaN(generationCount) || isNaN(best) || isNaN(average) || isNaN(stdev))) {
            if (!(best === -1111111)) {
              // No not push terminated generation
              this.pastEvolution.push(generation)
              // Populate data
              this.pastGraphOptions.xAxis.data.push(generationCount)
              this.pastGraphOptions.series[0].data.push(parseFloat(best))
              this.pastGraphOptions.series[1].data.push(parseFloat(average))
              var low = parseFloat(average) - parseFloat(stdev) / 2
              this.pastGraphOptions.series[2].data.push(low)
              this.pastGraphOptions.series[3].data.push(parseFloat(stdev))
            }
          }
        }
      })
    },
    loadResults (projectFolderPath, resultFolder) {
      if (resultFolder == null) {
        console.log('Not returning')
        return
      }

      console.log('Load Results')
      // Check for Evolution.json
      var fileName = projectFolderPath + '/' + resultFolder + '/evolution.json'
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the load result file :' + err.message)
          this.loadResultsTreditionally(projectFolderPath, resultFolder)
        }
        this.pastEvolution = JSON.parse(data)
        this.pastPopulation = 0
        // Update graph
        this.pastGraphOptions = JSON.parse(JSON.stringify(this.options)) // Make a copy of options for graph
        this.pastGraphOptions.tooltip.formatter = function (params) {
          return 'Generation ' + params[0].axisValue + '<br>Best Fitness = ' + params[0].value + '<br>Average Fitness = ' + params[1].value + '<br>STD = ' + params[3].value
        }
        // Reset data
        this.pastGraphOptions.xAxis.data = []
        this.pastGraphOptions.series[0].data = []
        this.pastGraphOptions.series[1].data = []
        this.pastGraphOptions.series[2].data = []
        this.pastGraphOptions.series[3].data = []

        // Loop and populate
        for (var i = 0; i < this.pastEvolution.length; i++) {
          if (!(this.pastEvolution[i].best === -1111111)) { // donot populate terminated data
            // Populate data
            this.pastGraphOptions.xAxis.data.push(this.pastEvolution[i].generation)
            this.pastGraphOptions.series[0].data.push(this.pastEvolution[i].best)
            this.pastGraphOptions.series[1].data.push(this.pastEvolution[i].avg)
            var low = this.pastEvolution[i].avg - this.pastEvolution[i].std / 2
            this.pastGraphOptions.series[2].data.push(low)
            this.pastGraphOptions.series[3].data.push(parseFloat(this.pastEvolution[i].std))
            if (this.pastPopulation < this.pastEvolution[i].fitness.length) {
              this.pastPopulation = this.pastEvolution[i].fitness.length
            }
          }
        }
      })
    },
    loadVis (generation, individual) {
      console.log('loading g' + generation + 'individual ' + individual)
    },
    hideTerminationModel () {
      this.$root.$emit('bv::hide::modal', 'terminateConfirm')
    },
    terminateEvolution () {
      this.killEvol()
      Event.$emit('endEvol', 99999)// Terminated evolution
      console.log('Terminating evolution')
    },
    killEvol () {
      var self = this
      var ls = childProcess.execFile(
        path.join(__static, 'scripts', 'evol', 'kill.sh')
      )

      ls.stdout.on('data', function (data) {
        if (data.includes('evol')) {
          self.$root.$emit('bv::hide::modal', 'terminateConfirm')
        }
        console.log('stdout: <' + typeof data + '> ')
      })

      ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data)
        alert(data)
      })

      ls.on('close', function (code) {
        console.log('child process exited with code ' + code)
      })
    }

  },
  computed: {
    update () {
      console.log('Update needed')
    },
    actualResultFolders () {
      return this.resultFolders.filter(resultFolder => !resultFolder.includes('output'))
    }
  },
  watch: {

    // saveCheck () {},
    update () {},
    resultFolders: function () {
      this.ongoingEvolution = false
      this.tabIndex = 0
      this.selectedFolder = this.getLatestEvolFolder()
      this.loadResults(this.projectFolderPath, this.selectedFolder)
    },
    ongoingEvolution () {
      this.$parent.ongoingEvolution = this.ongoingEvolution
    },
    selectedFolder () {
      this.loadResults(this.projectFolderPath, this.selectedFolder)
      this.pastNnVis['generation'] = -1
      this.pastNnVis['individual'] = -1
    }
  },
  // mounted () {
  //   this.maxCpuCount = os.cpus().length
  // },
  created () {
    var self = this
    Event.$on('newData', function (msg) {
      self.updateResult(msg)
    })

    Event.$on('endEvol', function (code) {
      if (!(code === 0 || code === 137 || code === 99999 || code === -1)) {
        alert('Evolution ended with code ' + code)
      }
      var evolutionData = self.evolution
      if (code === 99999) {
        evolutionData[evolutionData.length - 1].best = -1111111
        evolutionData[evolutionData.length - 1].avg = -1111111
        evolutionData[evolutionData.length - 1].std = -1111111
      }
      var filename = self.projectFolderPath + '/' + self.getLatestEvolFolder() + '/evolution.json'
      fs.writeFile(filename, JSON.stringify(evolutionData), function (err) {
        if (err) {
          return console.log(err)
        }
        Event.$emit('updateFiles')
      })
    })

    Event.$on('newEvol', function (_maxGenerations) {
      self.maxGenerations = parseInt(_maxGenerations)
      console.log('New Evolution Initialized. max generation=' + self.maxGenerations)
      self.ongoingEvolution = true
      self.tabIndex = 1
      self.evolution = [{'generation': 1, 'best': -1000000, 'avg': -1000000, 'std': -1000000, 'fitness': []}]
      self.population = 0
      self.maxFintess = 0
      self.minFitness = 100000000 // Unreasonably high value
      self.message = ''
      self.options.xAxis.data = []
      self.options.series[0].data = []
      self.options.series[1].data = []
      self.options.series[2].data = []
      self.options.series[3].data = []
      self.nnVis = { 'generation': 0, 'individual': 0, 'items': [], 'fields': [] }
    })

    this.colours = cmap({ 'colormap': 'bluered', 'nshades': 1000 })
  }
}
</script>


<style>
.echarts {
    width: 100%!important;
    height: 350px!important; /* or e.g. 400px */
}
.individuals{
  width: 50%;
}
.expand-button {
  padding: 0.1rem 0.5rem 0rem 0.5rem;
}
td[colspan="5"] {
  padding:0 !important;
}

header{
  height: 63px;
}
</style>
