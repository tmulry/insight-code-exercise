<template>
  <div class="hello">
    <h3>{{ heading }}</h3>
    <div
      v-if="loading"
      class="loading"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>
    <div
      v-if="!loading"
      class="insight-grid"
    >
      <div
        v-for="d in availableInsights"
        :key="d.id"
        class="grid-item"
      >
        <div><label>Name:</label> {{ d.name }}</div>
        <div><label>Description:</label> {{ d.description }}</div>
        <div><label>ID:</label> {{ d.id }}</div>
        <div><label>Constants:</label> <pre>{{ prettyPrint(d.constants) }}</pre></div>
        <div><label>Inlets:</label> <pre>{{ prettyPrint(d.inlets) }}</pre></div>
        <div><label>Outlets:</label> <pre>{{ prettyPrint(d.outlets) }}</pre></div>
      </div>
    </div>
  </div>
</template>

<script>
import { client } from '../composables/client.js';

const { getAvailableInsights } = client();
export default {
  name: 'AvailableInsights',
  props: {
    heading: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      availableInsights: []
    };
  },
  async created() {
    await this.getData();
  },
  methods: {
    async getData() {
      this.loading = true;
      try {
        let response =  await getAvailableInsights();
        this.loading = false;
        this.availableInsights = response;
      } catch (error) {
        this.loading = false;
        console.log(error);
      }
    },
    prettyPrint(obj) {
      return JSON.stringify(obj, null, 2);
    }
  }
    
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
.insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(620px, 1fr));
  grid-gap: 1rem;
  grid-auto-rows: minmax(100px, auto);

}
.grid-item {
    background-color: #fff;
    border-radius: 4px;
    padding: 1rem;
    border: #42b983 1px solid;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    margin: 1rem;
    text-align: initial;
  }
.grid-item  pre {
    background-color: #7c7c7c36;
    text-align: initial;
    overflow-x: scroll;
}

a {
  color: #42b983;
}


</style>
