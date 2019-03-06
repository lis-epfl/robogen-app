<template>
  <label class="file-select">
    <div class="select-button" v-bind:class="{disabled: disabled}" style="display:inline-block">
      <span v-if="value">Selected Folder</span>
      <span v-else>Select Folder</span>
    </div>
      <span style="display:inline-block">{{value}}</span>
    <input type="button" @click="get_folder" :disabled="disabled==true"/>
  </label>
</template>

<script>
const {dialog} = require('electron').remote
export default {
  props: {
    value: {
      type: String
    },
    defaultPath: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleFileChange (e) {
      this.$emit('input', e.target.files[0].name)
    },
    // Load file
    get_folder: function () {
      dialog.showOpenDialog({
        defaultPath: this.defaultPath,
        properties: ['openDirectory']
      }, (fileName) => {
        if (fileName === undefined) {
          console.log('Error no file selected')
          console.log(this.defaultPath)
        } else {
          // this.value = fileName[0]
          this.$emit('input', fileName[0])
        }
      })
    }
  }
}
</script>

<style scoped>

.file-select > .disabled {
  background-color: rgb(175, 175, 175)!important;
}

.file-select > .disabled:hover {
  outline: none;
  background-color: rgb(175, 175, 175)!important;
  border-color: rgb(175, 175, 175)!important;
  box-shadow: 0 0 0px rgb(175, 175, 175)!important;
}

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