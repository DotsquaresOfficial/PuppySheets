const axios = require('axios');

// currency
const currency = async (req, res) => {
    try {

          let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/currency/',
            headers: { 
              'Authorization': req.headers.authorization,
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