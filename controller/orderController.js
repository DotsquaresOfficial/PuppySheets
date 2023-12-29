const axios = require('axios');

// Post an order
const order = async (req, res) => {
    try {
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.uat.b2c2.net/order',
        headers: { 
          'Authorization': req.headers.authorization, 
          'Content-Type': 'application/json'
        },
        data : req.body
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

// Get an order
const get_an_order = async (req, res) => {
    try {
        console.log(req);
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/order/'+req.params.order_id,
            headers: { 
              'Authorization': req.headers.authorization
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
// Get an order
const get_multiple_order = async (req, res) => {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/order/',
            headers: { 
              'Authorization': req.headers.authorization
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
    order,
    get_an_order,
    get_multiple_order
  }