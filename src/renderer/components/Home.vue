<template>
    <div class="doc row" style="width:100%">
          <div class="col-md-8">
            <div class="home-main-title">Project Configuration</div>
            <div class="vue-form">
            <div>
                <label class="label">Main Folder: &nbsp;</label>
                <folder-select v-model="mainFolderPath" :disabled="true"></folder-select>
                <p class="errormsg" v-if="validateMainFolder()">{{validateMainFolder()}}</p>
                <!-- <a class="gernerate-dir">TODO: Generate Directories for Robogen 2019</a> -->
            </div>

            <div>
                <label class="label">Project Folder: &nbsp;</label>
                <folder-select v-model="projectFolderPath" :defaultPath=mainFolderPath></folder-select>
                <p class="errormsg" v-if="validateProjectFolder()">{{validateProjectFolder()}}</p>
                <div v-if="validateProjectFolder()==='' && validateMainFolder()===''" style="margin-left:20px;margin-top:10px">
                  <p><span class="file-type">Robot File:</span> <span class="file-name">{{robotFiles}}</span></p>
                  <p><span class="file-type">Scenario File:</span> <span class="file-name">{{scenarioFiles}}</span></p>
                  <p><span class="file-type">Simulation File:</span> <span class="file-name">{{simFiles}}</span></p>
                  <p><span class="file-type">Evolution File:</span> <span class="file-name">{{evolFiles}}</span></p>
                  <p><span class="file-type">Other File(s):</span> <span class="file-name">{{otherFiles}}</span></p>
                  <p><span class="file-type">Result Folder(s):</span> <span class="file-name">{{resultFolders}}</span></p>
                  <p><span class="file-type">Output Folder(s):</span> <span class="file-name">{{outputFolders}}</span></p>
                  <p class="errormsg">{{errorProjectFiles}}</p>
                </div>
            </div>

            </div>
            <div>
              <p style="color: rgba(128, 128, 128, 0.66);font-weight: bold;">
              Build number: <i> 2.0.0-beta </i>
              </p>
            </div>
            
          </div>
          <div class="col-md-4">
            <div class="row">
              <div class="home-title">Getting Started</div>
            </div>
            <div class="row">
              <p>
        This Robogen is an educational tool to design, simulate and evolve the robots. 
        </p>
            </div>
            <div class="row">
              <button @click="open('http://www.robogen.org')">Visit Robogen</button>
            </div>

            <div class="row">
              <div class="home-title alt">Other Documentation</div>
              <br>
              <button class="alt" @click="open('http://robogen.org/docs/evolution-configuration/')">Robogen Parameters</button>
              <br>
              <button class="alt" @click="open('http://robogen.org/docs/custom-scenarios/')">Scenarios</button>
            </div>
          </div>
    </div>
</template>
<script>
import FolderSelect from './Helper/FolderSelect.vue'
const os = require('os')
var fs = require('fs') // Load the File System to execute our common tasks (CRUD)

export default {
  components: {
    FolderSelect
  },
  data () {
    return {
      mainFolderPath: '/home/' + os.userInfo().username + '/Robogen/examples',
      projectFolderPath: '',
      errorProjectFolderPath: '',
      robotFiles: '',
      simFiles: '',
      scenarioFiles: '',
      evolFiles: '',
      otherFiles: [],
      errorProjectFiles: '',
      resultFolders: [],
      outputFolders: []
    }
  },
  methods: {
    open (link) {
      this.$electron.shell.openExternal(link)
    },
    validateProjectFolder () {
      if (this.projectFolderPath.includes(this.mainFolderPath)) {
        return ''
      } else {
        return 'Project folder should be a subfolder of main folder'
      }
    },
    validateMainFolder () {
      if (this.mainFolderPath === '') {
        return 'Main folder canot be empty'
      } else {
        return ''
      }
    },
    checkFileError (filetype, files) {
      if (files.length === 0) {
        alert(filetype + ' missing!', 'Configuration Warning')
      } else if (files.length > 1) {
        this.errorProjectFiles += 'Multiple ' + filetype + 's found \n'
      }
    },
    checkProjectFiles () {
      // Robot file
      this.errorProjectFiles = ''
      this.checkFileError('robot file', this.robotFiles)
      this.checkFileError('simulation file', this.simFiles)
      this.checkFileError('evolution file', this.evolFiles)
      this.checkFileError('scenario/fitness function file', this.scenarioFiles)

      this.$parent.fileUpdate(this.mainFolderPath, this.projectFolderPath, this.robotFiles, this.simFiles, this.evolFiles, this.resultFolders)
    },
    isDirectory (filepath, filename) {
      if (filename.includes('.')) {
        return false
      } else {
        var folderPath = filepath + '/' + filename
        var stat = fs.statSync(folderPath)
        if (stat.isDirectory()) {
          return true
        }
        return false
      }
    },
    updateFiles (filepath) {
      if (this.validateProjectFolder() === '') {
        this.otherFiles = []
        this.robotFiles = []
        this.simFiles = []
        this.scenarioFiles = []
        this.evolFiles = []
        this.resultFolders = []
        this.outputFolders = []
        var files = fs.readdirSync(filepath)
        for (var i = 0; i < files.length; i++) {
          if (files[i].includes('.robot.txt')) {
            this.robotFiles.push(files[i])
          } else if (files[i].includes('.sim.txt')) {
            this.simFiles.push(files[i])
          } else if (files[i].includes('.evol.txt')) {
            this.evolFiles.push(files[i])
          } else if (files[i].includes('.js')) {
            this.scenarioFiles.push(files[i])
          } else if (this.isDirectory(filepath, files[i])) {
            if (files[i].includes('output')) {
              this.outputFolders.push(files[i])
            } else {
              this.resultFolders.push(files[i])
            }
          } else {
            this.otherFiles.push(files[i])
          }
        }
        if (this.errorProjectFiles !== '') {
          this.errorProjectFiles += 'Make sure to choose right files for your projects. \n'
        }
        this.checkProjectFiles()
      }
    }
  },
  computed: {
    fireFileChange: function () {
      var temp = this.projectFolderPath + this.robotFiles + this.simFiles + this.evolFiles // eslint-disable-line no-unused-vars
      console.log('Firing update..' + temp)
      //
    }
  },
  watch: {
    projectFolderPath: function (filepath) {
      this.updateFiles(filepath)
    }
  },
  created () {
    var self = this
    Event.$on('updateFiles', function () {
      self.updateFiles(self.projectFolderPath)
    })
  }
}
</script>


<style>
.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.home-main-title{
  color: #2c3e50;
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 6px;
}

.home-title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.home-title.alt {
  font-size: 18px;
  margin-bottom: 10px;
  margin-top: 20px;
}

.doc{
  margin-top: 15px;
}

.doc p {
  color: black;
  margin-bottom: 10px;
}

.doc button {
  font-size: 0.8em;
  cursor: pointer;
  outline: none;
  padding: 0.75em 2em;
  border-radius: 2em;
  display: inline-block;
  color: #fff;
  background-color: #4fc08d;
  transition: all 0.15s ease;
  box-sizing: border-box;
  border: 1px solid #4fc08d;
  margin-bottom: 10px;
}

.doc button.alt {
  color: #42b983;
  background-color: transparent;
}

.gernerate-dir{
  font-size: 15px;
  color: #2EA169;
  text-decoration: underline;
  margin-top: -5px;
}

.errormsg{
  font-size: 15px;
  color: red!important;
}

.file-type{
  font-size: 16px;
  font-weight: 600
}

.file-name{
  font-size: 17px;
  font-style: italic;
  color: green
}
</style>

