<template>
  <div id="wrapper">
    <div class="header row">
      <div class="col-sm-8">
      <img id="logo" src="~@/assets/robogen_logo.png" alt="electron-vue">
      </div>
      <div class="col-sm-4">    
        <Settings></Settings>
      </div>
      <div class="row">
          <div style="margin-top:20px;">
            <a class="home-button" @click="show('home')"><font-awesome-icon icon="home" class="home-icon" /></a>
            <a href="#" class="action-button shadow animate blue main-body" @click="show('build')">Build a robot</a> 
            <a href="#" class="action-button shadow animate yellow main-body" @click="show('simulate')">Simulate a robot</a>
            <a href="#" class="action-button shadow animate red main-body" @click="show('evolve')">Evolve a robot</a>
            <a href="#" class="action-button shadow animate green main-body" @click="show('results')">Evolution Results</a>
          </div>
        </div>
      
    </div>
     <hr>
    <main>
      <div>
        <div class="row">
          <Home v-show="display==='home'" ></Home>
          <!-- <div class="build">Anand</div> -->
          <Build v-show="display==='build'" :projectFolderPath="projectFolderPath" :mainFolderPath="mainFolderPath" :robotFiles="robotFiles" ref="build"></Build>
          <Simulate v-show="display==='simulate'" :projectFolderPath="projectFolderPath" :mainFolderPath="mainFolderPath" :simFiles="simFiles" :robotFiles="robotFiles" ref="sim"></Simulate>
          <Evolve v-show="display==='evolve'" :projectFolderPath="projectFolderPath" :mainFolderPath="mainFolderPath" :simFiles="simFiles" :robotFiles="robotFiles" :evolFiles="evolFiles" ref="evol"></Evolve>
          <Results v-show="display==='results'" :projectFolderPath="projectFolderPath" :mainFolderPath="mainFolderPath" :resultFolders="resultFolders" ref="results"></Results>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import SystemInformation from './LandingPage/SystemInformation'
import Home from './Home'
import Build from './Build'
import Settings from './Settings'
import Simulate from './Simulate'
import Evolve from './Evolve'
import Results from './Results'
export default {
  data () {
    return {
      display: 'home',
      projectFolderPath: '',
      mainFolderPath: '',
      robotFiles: [],
      simFiles: [],
      evolFiles: [],
      resultFolders: []
    }
  },
  name: 'landing-page',
  components: { SystemInformation, Home, Build, Settings, Simulate, Evolve, Results },
  methods: {
    show (content) {
      this.display = content
    },
    fileUpdate (
      mainFolderPath,
      projectFolderPath,
      robotFiles,
      simFiles,
      evolFiles,
      resultFolders
    ) {
      this.saveAll()
      this.mainFolderPath = mainFolderPath
      this.projectFolderPath = projectFolderPath
      this.robotFiles = robotFiles
      this.simFiles = simFiles
      this.evolFiles = evolFiles
      this.resultFolders = resultFolders
    },
    saveAll () {
      this.$refs.build.saveFromParrent()
      // this.$refs.sim.saveFromParrent()
      // this.$refs.evol.saveFromParrent()
    }
  },
  created () {
    var self = this
    Event.$on('newEvol', function (msg) {
      self.display = 'results'
    })
  }
}
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

/* * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    
  } */

body {
  font-family: "Source Sans Pro", sans-serif;
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  width: 100%;
}

#wrapper {
  height: 100vh;
  /* padding: 60px 80px; */
  width: 100%;
}

.header {
  padding: 40px 50px 0px 50px;
}

main {
  padding: 20px 80px 0px 80px;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 200px;
}

.animate {
  transition: all 0.1s;
  -webkit-transition: all 0.1s;
}

.action-button {
  position: relative;
  padding: 5px 15px;
  margin: 0px 10px 10px 0px;
  float: left;
  border-radius: 10px;
  font-size: 20px;
  width: 260px;
  color: #fff;
  text-decoration: none;
  text-align: center;
}

.action-button:active,
.action-button:hover {
  font-weight: 500;
  color: #fff;
  text-decoration: none;
}

.blue {
  background-color: #3498db;
  border-bottom: 5px solid #2980b9;
  text-shadow: 0px -2px #2980b9;
}

.red {
  background-color: #e74c3c;
  border-bottom: 5px solid #bd3e31;
  text-shadow: 0px -2px #bd3e31;
}

.green {
  background-color: #82bf56;
  border-bottom: 5px solid #669644;
  text-shadow: 0px -2px #669644;
}

.yellow {
  background-color: #ecc54f;
  border-bottom: 5px solid #d1b358;
  text-shadow: 0px -2px #d1b358;
}

.action-button:active {
  transform: translate(0px, 5px);
  -webkit-transform: translate(0px, 5px);
  border-bottom: 1px solid;
}

hr {
  border: none;
  width: 100%;
  margin-top: 2px;
  border-bottom: 2px solid #d1d1d1;
}

.build {
  width: 100%;
  height: 100%;
  background: rgba(52, 152, 219, 0.15);
}

.home-button {
  float: left;
  background: rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 5px 1px rgba(0, 0, 0, 0.3);
  border-radius: 7px;
  margin: 1px 15px;
  padding: 1px;
}

.home-icon {
  font-size: 30px;
  margin: 5px;
  cursor: pointer;
}
</style>
