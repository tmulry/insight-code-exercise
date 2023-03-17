<template>
  <div class="hello">
    <h3>{{ heading }}</h3>
    
    <div class="single-column-card">
      <div>
        <label for="degrees">Degrees</label>
        <input
          id="degrees"
          v-model="degrees"
          type="number"
          name="degrees"
        >
      </div>
      <div>
        <label for="running">Running</label>
        <input
          id="running"
          v-model="running"
          type="checkbox"
          name="running"
        >
      </div>
      <div>
        <label for="filteredDegrees">Filtered Degrees (Output Z)</label>
        <input
          id="filteredDegrees"
          v-model="filteredDegrees"
          type="number"
          name="filteredDegrees"
          disabled
        >
      </div>
      <div>
        <label for="runningDegrees">Running Degrees (Output Y)</label>
        <input
          id="runningDegrees"
          v-model="runningDegrees"
          type="number"
          name="runningDegrees"
          disabled
        >
      </div>
      <div>
        <button @click.stop="checking = !checking">
          {{ !checking ? 'Check Temperature': 'Stop Checking' }}
        </button>
        
        <v-progress-circular
          v-if="checking"
          class="loading"
          indeterminate
          color="#42b983"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { client } from '../../utils/useClient.js';

const { getInsight } = client();

export default {
  name: 'TemperatureSensor',
  props: {
    heading: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      availableInsights: [],
      degrees: 0,
      running: false,
      checking: false,
      filteredDegrees: null,
      runningDegrees: null
    };
  },

  watch: {
    async checking(on) {
      if (on) {
        await this.checkTemperature();
      }
    }
  },
  methods: {
    getRequestData() {
      return [ {
        'generated': '4567',
        'origin': 'testOrigin',
        'ts': new Date().getTime() * 1000,
        'tags': { 'A': `${this.degrees}`,  'B': `${this.running ? 1 : 0}`}
      } ];
    },

    async getData() {
      this.loading = true;
      try {
        // get time in microseconds
        let response = await getInsight('temperature', this.getRequestData());
        const { filteredDegrees, runningDegrees } = this.getTemperatureFromResponse(response);
        console.log('fr',filteredDegrees, runningDegrees);
        this.filteredDegrees = filteredDegrees;
        this.runningDegrees = runningDegrees;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.log(error);
      }
    },

    async checkTemperature() {
      let maxChecks = 30;
      const pollingInterval = process.env.POLLING_INTERVAL*1000 || 1000;
      while( maxChecks-- > 0 && this.checking) {
        try {
          await this.getData();
          await new Promise(r => setTimeout(r, pollingInterval));
        } catch (error) {
          console.error(error);
          this.checking = false;
          break;
        }
      }
    },

    getTemperatureFromResponse(response) {
      return { 
        filteredDegrees : response?.[1]?.[0]?.['Z'],
        runningDegrees : response?.[1]?.[0]?.['Y'] 
      };
    }
  }
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.single-column-card {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 10px;
  padding: 10px;
  border: 1px solid #73987a;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);

  border-radius: 5px;
  margin: 1rem;
  padding: 1rem;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.single-column-card input {
  padding: 10px;
  border: 1px solid #73987a;
  border-radius: 5px;
}

input:disabled {
  background-color: #e6e6e6;
}

button, a {
  color: #ffffff;
  padding: 5px;
  border-radius: 5px;
  background-color: #42b983;
}

button {
  margin: 1rem;
}
</style>
