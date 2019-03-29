<template>
  <div class="row" style="width:100%">
    <div class="col-sm-6">
      <form class="vue-form" @submit.prevent="submit">
        <fieldset>
          <div class="row">
            <div style="padding:0">
              <legend style="border:0;margin:0;padding:0">Build a robot</legend>
              <label class="label" style="margin-top:-6px">
                {{selectedRobotFile}}
                <span
                  v-if="!saved"
                  style="cursor:pointer; text-decoration:underline; color:blue"
                  @click="save_file"
                >Save</span>
              </label>
            </div>
          </div>
          <label class="label" for="textarea">Robot File</label>
          <b-form-select v-model="selectedRobotFile" class="mb-3">
            <option
              v-for="robotFile in robotFiles"
              :key="robotFile"
              :title="robotFile"
              :value="robotFile"
            >{{robotFile}}</option>
            <option key="NewRobot" title="NewRobot" value="NewRobot">-- Build your own robot --</option>
          </b-form-select>
          <div>
            <label class="label" for="name">Robot Name</label>
            <input type="text" :disabled="selectedRobotFile !== '' && selectedRobotFile !== 'NewRobot'" required v-model="name" style="width:100%">
          </div>

          <div>
            <label class="label" for="textarea">Robot Body</label>
            <textarea
              @keydown.tab.prevent="tabber($event, 'body')"
              @keydown.enter.prevent="enter($event, 'body')"
              name="textarea"
              id="textarea"
              required
              v-model="body"
            ></textarea>
          </div>

          <div>
            <label class="label" for="textarea">Hidden Neurons</label>
            <textarea
              @keydown.tab.prevent="tabber($event, 'hiddenNeurons')"
              @keydown.enter.prevent="enter($event, 'hiddenNeurons')"
              name="textarea"
              id="textarea"
              required
              v-model="hiddenNeurons"
            ></textarea>
          </div>

          <div>
            <label class="label" for="textarea">Connections</label>
            <textarea
              @keydown.tab.prevent="tabber($event, 'connections')"
              @keydown.enter.prevent="enter($event, 'connections')"
              name="textarea"
              id="textarea"
              required
              v-model="connections"
            ></textarea>
          </div>

          <div>
            <label class="label" for="textarea">Bias</label>
            <textarea
              @keydown.tab.prevent="tabber($event, 'bias')"
              @keydown.enter.prevent="enter($event, 'bias')"
              name="textarea"
              id="textarea"
              required
              v-model="bias"
            ></textarea>
          </div>
        </fieldset>
      </form>
    </div>
    <div class="col-sm-6">
      <div class="debug">
        <div class="row title-box">
          <p class="title">{{name}}</p>
        </div>
        <div v-show="body.length>0">
          <div class="row">
            <p class="subtitle">Body</p>
          </div>
          <pre><code>{{ body }}</code></pre>
        </div>
        <div v-show="hiddenNeurons.length>0">
          <div class="row">
            <p class="subtitle">Hidden Neurons</p>
          </div>
          <pre><code>{{ hiddenNeurons }}</code></pre>
        </div>
        <div v-show="connections.length>0">
          <div class="row">
            <p class="subtitle">Connections</p>
          </div>
          <pre><code>{{ connections }}</code></pre>
        </div>
        <div v-show="bias.length>0">
          <div class="row">
            <p class="subtitle">Bias</p>
          </div>
          <pre><code>{{ bias }}</code></pre>
        </div>
        <div v-show="bias.length+connections.length+hiddenNeurons.length+body.length==0">
          <div class="row">
            <p class="subtitle" style="color:white;">--Empty--</p>
          </div>
        </div>
        <div v-show="bias.length+connections.length+hiddenNeurons.length+body.length>0">
          <input type="button" value="Test Me" @click="testRobot">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import path from 'path'
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
    robotFiles: {
      type: Array
    }
  },
  data () {
    return {
      selectedRobotFile: '',
      name: 'NewRobot',
      saved: true,
      body: '',
      hiddenNeurons: '',
      connections: '',
      bias: '',
      robotFile: '',
      seed: Math.floor(Math.random() * (100 - 0)) + 0,
      localProjectFolderPath: this.projectFolderPath,
      localRobotFiles: this.robotFiles,
      localMainFolderPath: this.mainFolderPath
    }
  },
  methods: {
    // Load file
    open_file: function () {
      console.log(this.projectFolderPath)
      dialog.showOpenDialog(
        {
          filters: [{ name: 'Robogen Robot File', extensions: ['robot.txt'] }],
          defaultPath: this.projectFolderPath
        },
        fileNames => {
          // fileNames is an array that contains all the selected
          if (fileNames === undefined) {
            console.log('No file selected')
            return
          }
          this.load_file(fileNames[0])
        }
      )
    },
    // Load specific file
    load_file: function (fileName) {
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the file :' + err.message)
          return
        }

        // Update file name
        this.filepath = fileName
        this.name = fileName.substring(
          fileName.lastIndexOf('/') + 1,
          fileName.indexOf('.')
        )

        // Change how to handle the file content
        var robot
        var finalRobot = []
        data = data.replace('\n\n', '\n\n,')
        robot = data.split(',')
        for (var i = 0; i < robot.length; i++) {
          if (robot[i].indexOf('\n\n') === 0) {
            finalRobot.push('')
            finalRobot.push('') // Add two empty elements instead of one
            finalRobot.push(robot[i].substring(2, robot[i].lastIndexOf('\n')))
          } else {
            finalRobot.push(
              robot[i].substring(0, robot[i].lastIndexOf('\n') - 1)
            )
          }
        }
        this.body = typeof finalRobot[0] === 'undefined' ? '' : finalRobot[0]
        this.hiddenNeurons =
          typeof finalRobot[1] === 'undefined' ? '' : finalRobot[1]
        this.connections =
          typeof finalRobot[2] === 'undefined' ? '' : finalRobot[2]
        this.bias = typeof finalRobot[3] === 'undefined' ? '' : finalRobot[3]
      })
      this.robotFile = fileName
      this.saved = true
    },
    // Content
    get_content: function () {
      var content = ''
      // body
      if (this.body.length > 0) {
        if (this.body.charAt(this.body.length - 1) !== '\n') {
          // chek if last element is new line
          this.body += '\n'
        }
        content += this.body
      }
      content += '\n' // empty line after body

      // hiddenNeurons
      if (this.hiddenNeurons.length > 0) {
        if (this.hiddenNeurons.charAt(this.hiddenNeurons.length - 1) !== '\n') {
          // chek if last element is new line
          this.hiddenNeurons += '\n'
        }
        content += this.hiddenNeurons
      }
      content += '\n' // empty line after hiddenNeurons

      // connections
      if (this.connections.length > 0) {
        if (this.connections.charAt(this.connections.length - 1) === '\n') {
          // chek if last element is new line
          this.connections += '\n'
        }
        content += this.connections
      }
      content += '\n' // empty line after connections

      // bias
      if (this.bias.length > 0) {
        if (this.bias.charAt(this.bias.length - 1) === '\n') {
          // chek if last element is new line
          this.bias += '\n'
        }
        content += this.bias
      }
      content += '\n' // empty line after connections

      return content
    },
    // Save file
    save_file: function (doSimulate) {
      console.log(this.projectFolderPath)
      var content = this.get_content()
      // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
      if (this.selectedRobotFile === 'NewRobot') {
        dialog.showSaveDialog(
          {
            defaultPath:
              this.projectFolderPath + '/' + this.name + '.robot.txt',
            filters: [{ name: 'Robogen Robot File', extensions: ['robot.txt'] }]
          },
          fileName => {
            if (fileName === undefined) {
              console.log("You didn't save the file")
              return
            }
            this.writeToFile(fileName, content, doSimulate)
          }
        )
      } else {
        var fileName = this.projectFolderPath + '/' + this.name + '.robot.txt'
        this.writeToFile(fileName, content, doSimulate)
      }
    },
    writeToFile: function (fileName, content, doSimulate) {
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, content, err => {
        if (err) {
          alert('An error ocurred creating the file ' + err.message)
        }
        this.filepath = fileName
        this.saved = true
        if (doSimulate) {
          this.runTest()
        }
      })
      // console.log(success)
      // if (success) {
      //   this.load_file(fileName)
      //   this.saved = true
      //   console.log('saved')
      // }
    },
    testRobot: function () {
      var self = this
      if (!this.saved) {
        self.save_file(true)
      } else {
        this.runTest()
      }
    },
    runTest: function () {
      var robFile = this.filepath.substring(
        this.filepath.indexOf('examples') + 9,
        this.filepath.length
      )
      var ls = childProcess.execFile(
        path.join(__static, 'scripts', 'sim', 'sim.sh'),
        [robFile, 'myConf.txt', this.seed]
      )

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
    },
    saveFromParrent () {
      if (this.saved) {
        return true
      } else {
        this.save_file()
        // var result = dialog.showMessageBox({
        //   title: 'Save Changes',
        //   message: 'Do you want to save the new changes in robot file?',
        //   buttons: ['Yes', 'No'],
        //   cancelId: 1
        // })
        // if (result === 0) {
        //   // Save file
        //   this.save_file()
        // } else {
        //   // discard
        // }
        // // this.$parent.show('home')
      }
    },
    tabber (event, model) {
      var text, originalSelectionStart, textStart, textEnd
      text = this[model]
      originalSelectionStart = event.target.selectionStart
      textStart = text.slice(0, originalSelectionStart)
      textEnd = text.slice(originalSelectionStart)

      this[model] = `${textStart}\t${textEnd}`
      event.target.value = this[model] // required to make the cursor stay in place.
      event.target.selectionEnd = event.target.selectionStart =
        originalSelectionStart + 1
    },
    enter (event, model) {
      var text, originalSelectionStart, textStart, textEnd
      text = this[model]
      originalSelectionStart = event.target.selectionStart
      textStart = text.slice(0, originalSelectionStart)
      textEnd = text.slice(originalSelectionStart)

      if (
        textStart.charAt(textStart.length - 1) === '\n' ||
        textEnd.charAt(0) === '\n'
      ) {
        // do nothing
      } else {
        this[model] = `${textStart}\n${textEnd}`
        event.target.value = this[model] // required to make the cursor stay in place.
        event.target.selectionEnd = event.target.selectionStart =
          originalSelectionStart + 1
      }
    }
  },
  computed: {
    saveCheck: function () {
      var temp = this.body + this.hiddenNeurons + this.connections + this.bias
      if (temp !== '') {
        // if the file is empty lets cosider to be saved
        this.saved = false
      }
    },
    update: function () {
      if (this.robotFiles.length > 0) {
        if (this.selectedRobotFile === '') {
          this.selectedRobotFile = this.robotFiles[0]
          this.load_file(this.projectFolderPath + '/' + this.robotFiles[0])
          this.saved = true
        } else if (this.selectedRobotFile !== 'NewRobot') {
          this.load_file(this.projectFolderPath + '/' + this.selectedRobotFile)
          this.saved = true
        } else {
          this.name = 'NewRobot'
          this.saved = true
          this.body = ''
          this.hiddenNeurons = ''
          this.connections = ''
          this.bias = ''
          this.localProjectFolderPath = this.projectFolderPath
          this.localRobotFiles = this.robotFiles
        }
        this.saved = true
      } else {
        this.name = 'NewRobot'
        this.saved = true
        this.body = ''
        this.hiddenNeurons = ''
        this.connections = ''
        this.bias = ''
        this.localProjectFolderPath = this.projectFolderPath
        this.localRobotFiles = this.robotFiles
      }
    }
  },
  watch: {
    saveCheck () {},
    update () {}
  }
}
</script>


<style>
@import url("https://fonts.googleapis.com/css?family=Source+Code+Pro:300,400");

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", Helvetica, Arial,
    sans-serif;
}

html,
body,
.container {
  min-height: 100vh;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

a {
  color: #2c3e50;
  text-decoration: none;
}

.head {
  font-size: 20px;
}

header {
  position: relative;
  height: 150px;
  padding-top: 100px;
}

header h1 {
  text-align: center;
  font-size: 2.4rem;
  font-weight: 300;
}

.vue-form {
  font-size: 16px;
  padding: 15px 30px;
  border-radius: 4px;
  margin: 15px auto;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 1px 10px 1px rgba(0, 0, 0, 0.3);
}
.vue-form fieldset {
  margin: 0 0 0 0;
}
.vue-form legend {
  padding-bottom: 10px;
  border-bottom: 1px solid #ecf0f1;
  display: inline-block;
}

.vue-form h4,
.vue-form .label {
  color: #94aab0;
  margin-top: 3px;
}
.vue-form .label {
  display: block;
  float: left;
}
.vue-form input,
.vue-form textarea,
.vue-form select,
.vue-form label {
  color: #2b3e51;
}

.vue-form textarea,
.vue-form select,
.vue-form legend {
  display: block;
  width: 100%;
  appearance: none;
}

.vue-form textarea,
.vue-form select {
  padding: 2px 7px;
  border: 1px solid #cfd9db;
  background-color: #ffffff;
  border-radius: 0.25em;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.08);
}

.vue-form input[type="number"],
.vue-form input[type="text"],
.vue-form input[type="email"] {
  padding: 2px 7px;
  border: 1px solid #cfd9db;
  background-color: #ffffff;
  border-radius: 0.25em;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.vue-form input[type="text"]:focus,
.vue-form input[type="email"]:focus,
.vue-form textarea:focus,
.vue-form select:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 5px rgba(44, 151, 222, 0.2);
}
.vue-form textarea {
  min-height: 100px;
  tab-size: 4;
  resize: vertical;
  overflow: auto;
}

.vue-form .vue-form-list {
  margin: 0px;
  padding-left: 0;
}
.vue-form .vue-form-list::after {
  clear: both;
  content: "";
  display: table;
}
.vue-form .vue-form-list li {
  display: inline-block;
  position: relative;
  user-select: none;
  margin: 0 26px 16px 0;
  float: left;
}
.vue-form input[type="radio"],
.vue-form input[type="checkbox"] {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  padding: 0;
  opacity: 0;
  z-index: 2;
}
.vue-form input[type="radio"] + label,
.vue-form input[type="checkbox"] + label {
  padding-left: 24px;
  padding-bottom: 0;
  margin-bottom: 0;
}
.vue-form input[type="radio"] + label::before,
.vue-form input[type="radio"] + label::after,
.vue-form input[type="checkbox"] + label::before,
.vue-form input[type="checkbox"] + label::after {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: -8px;
  width: 16px;
  height: 16px;
}
.vue-form input[type="radio"] + label::before,
.vue-form input[type="checkbox"] + label::before {
  border: 1px solid #cfd9db;
  background: #ffffff;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.08);
}
.vue-form input[type="radio"] + label::before,
.vue-form input[type="radio"] + label::after {
  border-radius: 50%;
}
.vue-form input[type="checkbox"] + label::before,
.vue-form input[type="checkbox"] + label::after {
  border-radius: 0.25em;
}
.vue-form input[type="radio"] + label::after,
.vue-form input[type="checkbox"] + label::after {
  background-color: #2c3e50;
  background-position: center center;
  background-repeat: no-repeat;
  box-shadow: 0 0 5px rgba(44, 151, 222, 0.4);
  display: none;
}
.vue-form input[type="radio"] + label::after {
  background-image: url("data:image/svg+xml;charset=utf-8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0D%0A%3C%21DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0D%0A%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%0D%0A%09%20width%3D%2216px%22%20height%3D%2216px%22%20viewBox%3D%220%200%2016%2016%22%20enable-background%3D%22new%200%200%2016%2016%22%20xml%3Aspace%3D%22preserve%22%3E%0D%0A%3Ccircle%20fill%3D%22%23FFFFFF%22%20cx%3D%228%22%20cy%3D%228%22%20r%3D%223%22%2F%3E%0D%0A%3C%2Fsvg%3E");
}
.vue-form input[type="checkbox"] + label::after {
  background-image: url("data:image/svg+xml;charset=utf-8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0D%0A%3C%21--%20Generator%3A%20Adobe%20Illustrator%2018.1.1%2C%20SVG%20Export%20Plug-In%20.%20SVG%20Version%3A%206.00%20Build%200%29%20%20--%3E%0D%0A%3C%21DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0D%0A%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%0D%0A%09%20width%3D%2216px%22%20height%3D%2216px%22%20viewBox%3D%220%200%2016%2016%22%20enable-background%3D%22new%200%200%2016%2016%22%20xml%3Aspace%3D%22preserve%22%3E%0D%0A%3Cpolyline%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22square%22%20stroke-miterlimit%3D%2210%22%20points%3D%225%2C8%207%2C10%2011%2C6%20%22%2F%3E%0D%0A%3C%2Fsvg%3E");
}
.vue-form input[type="radio"]:focus + label::before,
.vue-form input[type="checkbox"]:focus + label::before {
  box-shadow: 0 0 5px rgba(44, 151, 222, 0.6);
}
.vue-form input[type="radio"]:checked + label::after,
.vue-form input[type="checkbox"]:checked + label::after {
  display: block;
}
.vue-form input[type="radio"]:checked + label::before,
.vue-form input[type="radio"]:checked + label::after,
.vue-form input[type="checkbox"]:checked + label::before,
.vue-form input[type="checkbox"]:checked + label::after {
  animation: cd-bounce 0.3s;
}

.vue-form input[type="submit"] {
  border: none;
  background: #2c3e50;
  border-radius: 0.25em;
  padding: 12px 20px;
  color: #ffffff;
  font-weight: bold;
  float: right;
  cursor: pointer;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  appearance: none;
}
.no-touch .vue-form input[type="submit"]:hover {
  background: #42a2e1;
}
.vue-form input[type="submit"]:focus {
  outline: none;
  background: #2b3e51;
}
.vue-form input[type="submit"]:active {
  transform: scale(0.9);
}

input[type="button"] {
  display: inline-block;
  border: none;
  background: #3498db;
  border-radius: 0.25em;
  padding: 6px 10px;
  color: #ffffff;
  font-weight: bold;
  float: right;
  cursor: pointer;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  appearance: none;
}
.no-touch input[type="button"]:hover {
  background: #42a2e1;
}
input[type="button"]:focus {
  outline: none;
  background: #327bac;
}
input[type="button"]:active {
  transform: scale(0.9);
}

input:disabled {
  background: #c7c7c7 !important;
}

.vue-form .error-message {
  height: 35px;
  margin: 0px;
}
.vue-form .error-message p {
  background: #e94b35;
  color: #ffffff;
  font-size: 1.4rem;
  text-align: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  border-radius: 0.25em;
  padding: 16px;
}
.vue-form .error {
  border-color: #e94b35 !important;
}
.vue-form .counter {
  background-color: #ecf0f1;
  position: absolute;
  right: 0px;
  top: 0px;
  font-size: 10px;
  padding: 4px;
}

.debug {
  border-radius: 4px;
  margin: 15px auto;
  width: 100%;
  background-color: #000;
  padding: 5px;
  padding-bottom: 0px;
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 1px 10px 1px rgba(0, 0, 0, 0.3);
}

.debug pre {
  color: #ffffff;
  padding: 6px;
  margin-top: -18px;
  font-size: 15px;
  line-height: 20px;
  font-family: "Source Code Pro", monospace;
  font-weight: 300;
  white-space: pre-wrap;
  tab-size: 2;
}

.title-box {
  background-color: rgba(0, 0, 0, 0.9);
  box-shadow: 0 1px 10px 1px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  margin-top: -6px;
}

.title {
  font-family: "Source Code Pro", monospace;
  color: white;
  padding: 5px 11px;
  font-size: 20px;
}
/* .subtitle-box{
    margin: -6px 0px 15px 0px;
    background-color: rgba(0, 0, 0, 0.85);
    box-shadow: 0 1px 10px 1px rgba(0, 0, 0, 0.3);
    border-radius: 5px; 
} */

.subtitle {
  margin-top: 5px;
  font-family: "Source Code Pro", monospace;
  color: rgb(82, 156, 230);
  font-weight: 800;
  padding: 0px 20px;
  font-size: 17px;
}

@-webkit-keyframes cd-bounce {
  0%,
  100% {
    -webkit-transform: scale(1);
  }
  50% {
    -webkit-transform: scale(0.8);
  }
}
@-moz-keyframes cd-bounce {
  0%,
  100% {
    -moz-transform: scale(1);
  }
  50% {
    -moz-transform: scale(0.8);
  }
}
@keyframes cd-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.8);
  }
}
</style>
