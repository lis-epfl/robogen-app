<template>
 <form class="vue-form" @submit.prevent="submit">
    <fieldset>
      <div class="row">
          <div class="col-sm-8" style="padding:0"> <legend style="border:0;margin:0">Evolution Results <legend style="font-size:16px">{{name}}</legend></legend></div>
          <div class="col-sm-4" style="padding:0"><input type="button" value="Load File" ></div>
      </div>
      <b-tabs>
        <b-tab v-for="folder in resultFolders" :key="folder" :title="folder" :class="{ active: $first }">
            <br>I'm the first fading tab
        </b-tab>
      </b-tabs>
    </fieldset>
 </form>
</template>

<script>
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
      localResultFolders: this.resultFolders
    }
  },
  computed: {
    update () {
      console.log('Update needed')
    }
  },
  watch: {
    // saveCheck () {},
    update () {}
  }
}
</script>


<style>

</style>
