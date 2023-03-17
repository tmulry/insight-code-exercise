import axios from 'axios';

export const client = () => {


  const host = process.env.INSIGHT_HOST || 'http://localhost:5000';
  const solution_id = process.env.SOLUTION_ID || 1234;
  const client = axios.create({
    baseURL: `${host}/api/v1/${solution_id}/`,
    timeout: 1000
  });


  const getAvailableInsights = async () => {
    const response = await client.post('/insights', {
      offset: 0,
      group_id: 'test',
      limit: 0
    });
    return response.data?.insights || [];
  };

  const getInsight = async (functionId, data) => {

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

  return { getAvailableInsights, getInsight };
};
