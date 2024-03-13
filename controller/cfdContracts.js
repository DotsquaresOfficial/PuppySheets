const axios = require('axios');

// Get multiple contract_entries
const get_multiple_contract_entries = async (req, res) => {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/cfd/contracts/',
            headers: { 
              'Authorization': req.headers.authorization,
              "Content-Type": "application/json",
            },
            data:req.body
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
    get_multiple_contract_entries
  }