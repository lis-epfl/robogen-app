<template>
  <div id="wrapper">
    <div class="row">
      <div class="col-sm-8">
      <img id="logo" src="~@/assets/robogen_logo.png" alt="electron-vue">
      </div>
      <div class="col-sm-4">    
        <Settings></Settings>
      </div>
    </div>
    <main>
      <div>
        <div class="row">
          <div style="margin-top:20px;">
            <a href="#" class="action-button shadow animate blue main-body" @click="show('build')">Build a robot</a> 
            <a href="#" class="action-button shadow animate green main-body" @click="show('simulate')">Simulate a robot</a>
            <a href="#" class="action-button shadow animate red main-body" @click="show('evolve')">Evolve a robot</a>
          </div>
          <hr>
        </div>
        <div class="row">
          <Home v-show="display==='home'" ></Home>
          <!-- <div class="build">Anand</div> -->
          <Build v-show="display==='build'" :projectFolderPath="projectFolderPath" :mainFolderPath="mainFolderPath" :robotFiles="robotFiles" ref="build"></Build>
          <Simulate v-show="display==='simulate'" :projectFolderPath="projectFolderPath" :mainFolderPath="mainFolderPath" :simFiles="simFiles" :robotFiles="robotFiles" ref="sim"></Simulate>
          <Evolve v-show="display==='evolve'" :projectFolderPath="projectFolderPath" :mainFolderPath="mainFolderPath" :simFiles="simFiles" :robotFiles="robotFiles"></Evolve>
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
export default {
    data () {
      return {
        display: 'home',
        projectFolderPath: '',
        mainFolderPath: '',
        robotFiles: [],
        simFiles: [],
        evolFiles: []
      }
    },
    name: 'landing-page',
    components: {SystemInformation, Home, Build, Settings, Simulate, Evolve},
    methods: {
      show (content) {
        this.display = content
      },
      fileUpdate (mainFolderPath, projectFolderPath, robotFiles, simFiles, evolFiles) {
        this.saveAll()
        this.mainFolderPath = mainFolderPath
        this.projectFolderPath = projectFolderPath
        this.robotFiles = robotFiles
        this.simFiles = simFiles
        this.evolFiles = evolFiles
      },
      saveAll () {
        this.$refs.build.saveFromParrent()
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  /* * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    
  } */

  body { font-family: 'Source Sans Pro', sans-serif;
  background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      ); }

  #wrapper {
    
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 200px;
  }

  .animate
  {
    transition: all 0.1s;
    -webkit-transition: all 0.1s;
  }

  .action-button
  {
    position: relative;
    padding: 5px 15px;
    margin: 0px 10px 10px 0px;
    float: left;
    border-radius: 10px;
    font-size: 20px;
    width: 260px;
    color: #FFF;
    text-decoration: none;	
    text-align: center;
  }

  .action-button:active,.action-button:hover{
    font-weight:500;
    color: #FFF;
    text-decoration: none;	
  }

  .blue
  {
    background-color: #3498DB;
    border-bottom: 5px solid #2980B9;
    text-shadow: 0px -2px #2980B9;
  }

  .red
  {
    background-color: #E74C3C;
    border-bottom: 5px solid #BD3E31;
    text-shadow: 0px -2px #BD3E31;
  }

  .green
  {
    background-color: #82BF56;
    border-bottom: 5px solid #669644;
    text-shadow: 0px -2px #669644;
  }

  .yellow
  {
    background-color: #F2CF66;
    border-bottom: 5px solid #D1B358;
    text-shadow: 0px -2px #D1B358;
  }

  .action-button:active
  {
    transform: translate(0px,5px);
    -webkit-transform: translate(0px,5px);
    border-bottom: 1px solid;
  }

  hr {
    border:none;
    width: 100%;
    margin-top: 2px;
    border-bottom: 2px solid #d1d1d1;
  }

  .build{
    width: 100%;
    height: 100%;
    background: rgba(52, 152, 219, 0.15);
  }

  
</style>
