import { ref } from 'vue';
import axios from 'axios';

export const client = () => {
  const message = ref('This message is in our composable!');
  //   todo make host and solution an env var?
  const solution_id = 1234;
  const client = axios.create({
    baseURL: `http://localhost:5000/api/v1/${solution_id}/`,
    timeout: 1000
  });
  const printMessage = () => {
    console.log(message.value);
  };

  const getAvailableInsights = async () => {
    // wait 500 ms to simulate a slow connection
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = await client.post('/insights', {
      offset: 0,
      group_id: 'test',
      limit: 0
    });
    return response.data?.insights || [];
  };

  const getInsight = async (functionId, data) => {

    await new Promise((resolve) => setTimeout(resolve, 500));

    const request = {
      args: {
        group_id: '123',
        function_id: functionId,
        constants: {}
      },
      data,
      id: 'id',
      history: {}
    };
    const response = await client.post('/process', request);
    return response.data;
  };

  return { message, printMessage, getAvailableInsights, getInsight };
};
