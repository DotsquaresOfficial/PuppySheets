const axios = require('axios');

// currency
const currency = async (req, res) => {
    try {

          let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${process.env.API_BASE_URL}currency/`,
            headers: { 
              'Authorization': `Token ${process.env.AUTHORIZATION}`
            },
          };
          
          axios.request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
            res.json(response.data);
          })
          .catch((error) => {
            console.log(error);
            res.json(error);
          });
      } catch (error) {
        console.log(error);
        res.json(error);
      }
};
module.exports = {
    currency
  }