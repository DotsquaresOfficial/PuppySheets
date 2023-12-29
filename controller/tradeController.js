const axios = require('axios');

// Get a trade
const get_a_trade = async (req, res) => {
    try {
    
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/trade/'+req.params.trade_id,
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


// Get multiple trade
const get_multiple_trade = async (req, res) => {
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.uat.b2c2.net/trade',
        headers: { 
          'Authorization': req.headers.authorization,
          'Content-Type': 'application/json'
        },
        data : req.body
      };
      axios.request(config)
      .then((response) => {
        res.json(response.data);
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.json(error);
        console.log(error);
      });
      
      } catch (error) {
        console.log(error);
        res.json(error);
      }
};

module.exports = {
    get_a_trade,
    get_multiple_trade
  }