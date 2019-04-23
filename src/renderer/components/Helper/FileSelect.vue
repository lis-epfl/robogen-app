<template>
  <label class="file-select">
    <div class="select-button" style="display:inline-block">
        <span v-if="filePath">Selected File</span>
        <span v-else>Select File <br> <span class="select-extention">{{accept[0].ext}}</span></span>
    </div>
      <span style="display:inline-block">{{filePath.substring(filePath.lastIndexOf('/') + 1)}}</span>
      <input type="button" @click="get_file"/>
      <span v-if="optional&&filePath" @click.prevent="removeFile">&nbsp;<font-awesome-icon icon="trash-alt" class="text-danger"/></span>
  </label>
</template>

<script>
import path from 'path'
const {dialog} = require('electron').remote
const childProcess = require('child_process') // The power of Node.JS
export default {
  props: {
    value: {
      type: String
    },
    accept: {
      type: Array
    },
    defaultPath: {
      type: String
    },
    mainFolderPath: {
      type: String
    },
    optional: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      filePath: ''
    }
  },
  methods: {
    // Load file
    get_file: function () {
      console.log(this.defaultPath)
      dialog.showOpenDialog({
        defaultPath: this.defaultPath,
        filters: [
          { name: this.accept[0].name, extensions: this.accept[0].ext }
        ]
      }, (fileName) => {
        if (fileName === undefined) {
          console.log('Error no file selected')
          console.log(this.defaultPath)
        } else {
          var file = fileName[0].substring(
            fileName[0].indexOf(this.mainFolderPath) + this.mainFolderPath.length + 1,
            fileName[0].length
          )
          if (fileName[0].includes('.json')) {
            this.filePath = fileName[0].substring(0, fileName[0].length - '.json'.length) + '.robot.txt'
            console.log(this.filePath)
            console.log('Do convertion. ' + file, ' ', file.substring(0, file.length - '.json'.length) + '.robot.txt')
            var ls = childProcess.execFile(
              path.join(__static, 'scripts', 'sim', 'robotConvert.sh'),
              [file, file.substring(0, file.length - '.json'.length) + '.robot.txt']
            )
            ls.stdout.on('data', function (data) {
              console.log('stdout: <' + data + '> ')
              // alert('stdout: <' + data + '> ')
            })

            ls.stderr.on('data', function (data) {
              alert(data, 'Robogen Logger')
              this.filePath = ''
            })

            ls.on('close', function (code) {
              console.log('JSONConverter process exited with code ' + code)
            })
          } else {
            this.filePath = fileName[0]
          }
          this.$emit('input', this.filePath)
        }
      })
    },
    updateFilePath: function (filePath) {
      console.log('Updating file path: ' + filePath)
      this.filePath = filePath
    },
    removeFile: function () {
      this.filePath = ''
      this.$emit('input', this.filePath)
    }
  },
  computed: {
    getFileName: function () {
      return this.filePath.substring(this.filePath.lastIndexOf('/') + 1)
    }
  }
}
</script>

<style scoped>
.file-select > .select-button {
  padding: 0.3rem;

  color: white;
  background-color: #2EA169;

  border-radius: .3rem;

  text-align: center;
  font-weight: bold;
}

.select-extention {
  font-weight:100;
  font-size: 15px;
}

.file-select > input[type="button"] {
  display: none;
}

.file-select > .select-button:hover {
  outline: none;
  background-color: rgb(27, 136, 83);
  border-color: rgb(27, 136, 83);
  box-shadow: 0 0 8px rgba(27, 136, 83, 0.5);
}
</style>