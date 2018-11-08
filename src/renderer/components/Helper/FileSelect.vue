<template>
  <label class="file-select">
    <div class="select-button" style="display:inline-block">
        <span v-if="filePath">Selected File</span>
        <span v-else>Select File <br> <span class="select-extention">{{accept[0].ext}}</span></span>
    </div>
      <span style="display:inline-block">{{getFileName()}}</span>
      <input type="button" @click="get_file"/>
      <span v-if="optional&&filePath" @click.prevent="removeFile">&nbsp;<font-awesome-icon icon="trash-alt" class="text-danger"/></span>
  </label>
</template>

<script>
const {dialog} = require('electron').remote
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
          this.filePath = fileName[0]
          this.$emit('input', this.filePath)
        }
      })
    },
    getFileName: function () {
      return this.filePath.substring(this.filePath.lastIndexOf('/') + 1)
    },
    updateFilePath: function (filePath) {
      this.filePath = filePath
    },
    removeFile: function () {
      this.filePath = ''
      this.$emit('input', this.filePath)
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