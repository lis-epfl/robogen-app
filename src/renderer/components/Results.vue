<template>
 <form class="vue-form" @submit.prevent="submit">
    <fieldset>
      <div class="row">
          <div class="col-sm-8" style="padding:0"> <legend style="border:0;margin:0">Evolution Results </legend></div>
          <div class="col-sm-4" style="padding:0"><input type="button" value="Load File" ></div>
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
          <b-form-select v-model="selectedFolder" class="mb-3">
            <option :value="null" disabled>-- Please select an pre-evolved folder --</option>
            <option v-for="folder in resultFolders" :key="folder" :title="folder" :value="folder">{{folder}}</option>
          </b-form-select>
            <br>
            <div style="width:100%">
              <v-chart :options="pastGraphOptions" :autoResize="true"/>
            </div>
            <hr>
            <b-table striped bordered outlined hover footClone :items="pastEvolution" :fields="fields">
              <template slot="individuals" slot-scope="data" >
                TBD
                <!-- <b-progress :max="population" class="mb-2">
                  <b-progress-bar v-for="fitnessValue in data.item.fitness" :key="fitnessValue" :value="1" :style="{ backgroundColor: getColour(fitnessValue)}"></b-progress-bar>
                </b-progress> -->
              </template>
            </b-table>
        </b-tab>

        <b-tab title="Ongoing Evolution" key="Ongoing Evolution">
            <br>
            <div style="width:100%">
            <v-chart :options="options" :autoResize="true"/>
            </div>
            <hr>
            <b-table striped bordered outlined hover footClone :items="evolution" :fields="fields" >
              <template slot="individuals" slot-scope="data">
                <b-progress :max="population" class="mb-2">
                  <b-progress-bar v-for="(fitnessValue,index) in data.item.fitness" :key="fitnessValue" :value="1" v-b-tooltip.hover :title="getTooltip(data.item.generation, index , fitnessValue)" :style="{ backgroundColor: getColour(fitnessValue)}"><span v-on:click="getVis(data.item.generation, index , fitnessValue)" style="width:100%;height:100%"></span></b-progress-bar>
                </b-progress>
              </template>
            </b-table>
        </b-tab>
      </b-tabs>
    </fieldset>
 </form>
</template>

<script>
import 'echarts/lib/component/axis'
import 'echarts/lib/echarts'
var fs = require('fs') // Load the File System to execute our common tasks (CRUD)
// var os = require('os')
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
      evolution: [{'generation': '1', 'best': 0.000539646, 'avg': 0.000106292, 'std': 0.000146535, 'fitness': [2, 2, 3, 4]}],
      // {"generation":"1","best":0.000539646,"avg":0.000106292,"std":0.000146535,"fitness":[1,2,3,4]}
      pastEvolution: [],
      // {'foldername': [{}, {}]}
      maxFintess: 0,
      minFitness: 100000000, // Unreasonably high value
      population: 0,
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
            magicType: {show: true, type: ['tiled']},
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
            padding: [60, 0, 0, 0]
          },
          data: [],
          nameGap: 35,
          min: 0
        },
        yAxis: {
          type: 'value',
          name: 'Fitness Value',
          nameLocation: 'Center',
          nameTextStyle: {
            padding: [0, 0, 100, 0]
          },
          min: 0,
          nameRotate: 90,
          nameGap: 50
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            animation: false,
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
            smooth: true
          },
          {
            name: 'Average',
            data: [],
            type: 'line',
            smooth: true
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
          label: 'Individuals'
        }
      },
      colours: []

    }
  },
  methods: {
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
      // var average = generation['avg']
      // var std = generation['std']
      var fitnesses = gen['fitness']

      // Best shoud be one of the indiduvial. Sometime console outputs 002525 instead of 0.002525
      if (Math.max.apply(null, fitnesses) !== best) {
        console.log('Best reset. Obtained=' + best + ' Actual=' + Math.max.apply(null, fitnesses))
        gen['best'] = Math.max.apply(null, fitnesses) // Reset the best
      }
      return gen
    },
    getColour (fitness) {
      var location = (fitness - this.minFitness) / (this.maxFintess - this.minFitness)
      location = parseInt(location * this.colours.length)
      if (fitness === this.maxFintess) {
        return '#00FF00'
      }
      return this.colours[location]
    },
    getTooltip (generation, index, fitnessValue) {
      var tooltip = ''
      if (fitnessValue === this.maxFintess) {
        tooltip += 'Best Individual \n'
      }
      return tooltip + 'G' + generation + ' (I' + (index + 1) + ') : ' + fitnessValue
    },
    getVis (generation, index, fitnessValue) {
      var files = fs.readdirSync(this.projectFolderPath)
      var latest = 0
      for (var i = 0; i < files.length; i++) {
        if (files[i].includes('evol_results_')) {
          console.log(files[i])
          latest = parseInt(files[i].substring('evol_results_'.length))
        }
      }
      var folder = this.projectFolderPath + '/evol_results'
      if (latest !== 0) {
        folder += '_' + latest
      }

      var simConfFile = folder
      files = fs.readdirSync(folder)
      for (i = 0; i < files.length; i++) {
        if (files[i].includes('.sim.txt')) {
          simConfFile += '/' + files[i]
          break
        }
      }

      var vis = {}
      vis['robotfile'] = folder + '/GenerationBest-' + generation + '.json'
      vis['simConfFile'] = simConfFile
      Event.$emit('visualize', vis)
      console.log(vis)
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
        this.message = this.message.replace('.', '') // Remove dots from the message
      }
      while (this.message.includes('mainEvolutionLoop')) {
        console.log('In while loop. messgee =' + this.message)
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
          this.evolution.push(generation)
          this.message = this.message.substring(end) // Erase the part above

          this.options.xAxis.data.push(generation['generation'])
          this.options.series[0].data.push(generation['best'])
          this.options.series[1].data.push(generation['avg'])
          var low = parseFloat(generation['avg']) - parseFloat(generation['std']) / 2
          if (low < 0) { low = 0 }
          this.options.series[2].data.push(low)
          this.options.series[3].data.push(parseFloat(generation['std']))
          console.log(this.evolution)
        }
      }
      if (this.message !== '') {
        console.log('Remaining message = ' + this.message)
      }
    },
    loadResults (projectFolderPath, resultFolder) {
      // Load BestAvgStd.txt
      var fileName = projectFolderPath + '/' + resultFolder + '/BestAvgStd.txt'
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the file :' + err.message)
          return
        }
        var values = data.split('\n').join(' ').split(' ')
        // Initialize
        this.pastEvolution = [] // Data for table
        this.pastGraphOptions = JSON.parse(JSON.stringify(this.options)) // Make a copy of options for graph
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
            this.pastEvolution.push(generation)
            // Populate data
            this.pastGraphOptions.xAxis.data.push(generationCount)
            this.pastGraphOptions.series[0].data.push(parseFloat(best))
            this.pastGraphOptions.series[1].data.push(parseFloat(average))
            var low = parseFloat(average) - parseFloat(stdev) / 2
            if (low < 0) { low = 0 }
            this.pastGraphOptions.series[2].data.push(low)
            this.pastGraphOptions.series[3].data.push(parseFloat(stdev))
          }
        }
      })
    }
  },
  computed: {
    update () {
      console.log('Update needed')
    }
  },
  watch: {

    // saveCheck () {},
    update () {},
    resultFolders: function () {
      this.ongoingEvolution = false
    },
    selectedFolder () {
      this.loadResults(this.projectFolderPath, this.selectedFolder)
    }
  },
  // mounted () {
  //   this.maxCpuCount = os.cpus().length
  // },
  created () {
    var self = this
    Event.$on('newData', function (msg) {
      self.updateResult(new TextDecoder('utf-8').decode(msg))
    })

    Event.$on('newEvol', function (msg) {
      console.log('New Evolution')
      self.ongoingEvolution = true
      self.evolution = []
      self.population = 0
      self.maxFintess = 0
      self.minFitness = 100000000 // Unreasonably high value
      self.population = 0
      self.message = ''
      self.options.xAxis.data = []
      self.options.series[0].data = []
      self.options.series[1].data = []
      self.options.series[2].data = []
      self.options.series[3].data = []
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
</style>
