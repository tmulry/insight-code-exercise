<template>
  <div id="app">
    <div class="app-bar">
      <div class="corner-logo">
        <img
          alt="Mulry logo"
          src="./../assets/1.png"
        >
      </div>
    </div>
    <div class="main">
      <TemperatureSensor heading="Temperature Checker" />
      <AvailableInsights heading="Available Insights" />
    </div>
  </div>
</template> 

<script>
import TemperatureSensor from './Sensors/TemperatureSensor.vue';
import AvailableInsights from './AvailableInsights.vue';
export default {
  name: 'AppLayout',
  components: {
    TemperatureSensor,
    AvailableInsights
  }
};
</script>


<style>

  .corner-logo {
    /* position: absolute; */
    top: 0;
    left: 0;
    width: 64px;
    height: 64px;

  }

  .corner-logo img {
    width: 100%;
    height: 100%;
  }

  .app-bar {
    background-color: #fff;
    height: 64px;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,.14);
  }

  .main {
    margin-top: 64px;
    padding: 1rem;
  }

  .main label {
    font-weight: bold;
    margin: 1rem;
  }

  h3 {
    margin: 40px 0 0;
  }



</style>
