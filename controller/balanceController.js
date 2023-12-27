const axios = require('axios');

// Get Balance
const get_balance = async (req, res) => {
    try {

        console.log(req.headers.authorization)
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/balance/',
            headers: { 
                'Authorization': req.headers.authorization
            }
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
    get_balance
  }