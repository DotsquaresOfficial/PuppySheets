const axios = require('axios');

// Get a trade
const get_a_trade = async (req, res) => {
    try {
    
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/trade/'+req.body.trade,
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
        let data = JSON.stringify({
            'created__gte': req.body.created__gte,
            'created__lt': req.body.created__lt
          });

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/trade/',
            headers: { 
              'Authorization': req.headers.Authorization
            },
            data:data
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
    get_a_trade,
    get_multiple_trade
  }